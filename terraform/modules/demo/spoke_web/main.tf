terraform {
  required_version = ">= 1.3, < 2.0.0"
  required_providers {
    aws = { source = "hashicorp/aws" }
  }
}

data "aws_vpc" "security" {
  id = var.security_vpc_id
}
data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}
resource "aws_vpc" "demo" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = merge(var.tags, { Name = "${var.name}-spoke" })
}
resource "aws_internet_gateway" "demo" {
  vpc_id = aws_vpc.demo.id
  tags   = merge(var.tags, { Name = "${var.name}-igw" })
}
resource "aws_subnet" "workload" {
  vpc_id            = aws_vpc.demo.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 0)
  availability_zone = var.availability_zone
  tags              = merge(var.tags, { Name = "${var.name}-workload" })
}
resource "aws_subnet" "endpoint" {
  vpc_id            = aws_vpc.demo.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 1)
  availability_zone = var.availability_zone
  tags              = merge(var.tags, { Name = "${var.name}-gwlbe" })
}
resource "aws_vpc_endpoint" "inspection" {
  vpc_id            = aws_vpc.demo.id
  service_name      = var.gwlb_service_name
  vpc_endpoint_type = "GatewayLoadBalancer"
  subnet_ids        = [aws_subnet.endpoint.id]
  tags              = merge(var.tags, { Name = "${var.name}-inspection" })
}
resource "aws_route_table" "workload" {
  vpc_id = aws_vpc.demo.id
  tags   = merge(var.tags, { Name = "${var.name}-workload" })
}
resource "aws_route" "outbound_inspection" {
  route_table_id         = aws_route_table.workload.id
  destination_cidr_block = "0.0.0.0/0"
  vpc_endpoint_id        = aws_vpc_endpoint.inspection.id
}
resource "aws_route_table_association" "workload" {
  subnet_id      = aws_subnet.workload.id
  route_table_id = aws_route_table.workload.id
}
resource "aws_route_table" "endpoint" {
  vpc_id = aws_vpc.demo.id
  tags   = merge(var.tags, { Name = "${var.name}-endpoint" })
}
resource "aws_route" "internet" {
  route_table_id         = aws_route_table.endpoint.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.demo.id
}
resource "aws_route_table_association" "endpoint" {
  subnet_id      = aws_subnet.endpoint.id
  route_table_id = aws_route_table.endpoint.id
}
resource "aws_route_table" "ingress" {
  vpc_id = aws_vpc.demo.id
  tags   = merge(var.tags, { Name = "${var.name}-igw-ingress" })
}
resource "aws_route" "inbound_inspection" {
  route_table_id         = aws_route_table.ingress.id
  destination_cidr_block = aws_subnet.workload.cidr_block
  vpc_endpoint_id        = aws_vpc_endpoint.inspection.id
}
resource "aws_route_table_association" "ingress" {
  gateway_id     = aws_internet_gateway.demo.id
  route_table_id = aws_route_table.ingress.id
}
# Syslog is local-out management traffic. Give it a private path independent of GENEVE.
resource "aws_vpc_peering_connection" "telemetry" {
  vpc_id      = var.security_vpc_id
  peer_vpc_id = aws_vpc.demo.id
  auto_accept = true
  tags        = merge(var.tags, { Name = "${var.name}-telemetry" })
}
resource "aws_route" "telemetry_to_server" {
  for_each                  = var.management_route_tables
  route_table_id            = each.value
  destination_cidr_block    = "${local.collector_ip}/32"
  vpc_peering_connection_id = aws_vpc_peering_connection.telemetry.id
}
resource "aws_route" "telemetry_return" {
  route_table_id            = aws_route_table.workload.id
  destination_cidr_block    = data.aws_vpc.security.cidr_block
  vpc_peering_connection_id = aws_vpc_peering_connection.telemetry.id
}
resource "aws_security_group" "web" {
  name_prefix = "${var.name}-"
  description = "Lab browser access and private FortiGate syslog"
  vpc_id      = aws_vpc.demo.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_client_cidrs
  }
  ingress {
    from_port   = 5514
    to_port     = 5514
    protocol    = "udp"
    cidr_blocks = var.management_cidrs
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = var.tags
}
resource "aws_iam_role" "web" {
  name_prefix        = "${var.name}-"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Action = "sts:AssumeRole", Principal = { Service = "ec2.amazonaws.com" } }] })
  tags               = var.tags
}
resource "aws_iam_role_policy" "discovery" {
  role = aws_iam_role.web.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{
    Effect = "Allow", Resource = "*",
    Action = ["autoscaling:DescribeAutoScalingGroups", "ec2:DescribeInstances", "elasticloadbalancing:DescribeTargetHealth"]
  }] })
}
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.web.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
resource "aws_iam_instance_profile" "web" {
  name_prefix = "${var.name}-"
  role        = aws_iam_role.web.name
}
locals {
  private_ip   = cidrhost(aws_subnet.workload.cidr_block, 10)
  collector_ip = cidrhost(aws_subnet.workload.cidr_block, 11)
  config       = jsonencode({ region = var.region, asg_names = var.asg_names, target_group_arn = var.target_group_arn, private_ip = local.private_ip, syslog_port = 5514 })
}
resource "aws_instance" "web" {
  ami           = data.aws_ssm_parameter.al2023.value
  instance_type = "t3.micro"
  network_interface {
    network_interface_id = aws_network_interface.web.id
    device_index         = 0
  }
  iam_instance_profile        = aws_iam_instance_profile.web.name
  user_data_replace_on_change = true
  user_data_base64 = base64gzip(templatefile("${path.module}/cloud-init.yaml.tftpl", {
    server    = filebase64("${path.module}/assets/server.py")
    page      = filebase64("${path.module}/assets/index.html")
    config    = base64encode(local.config)
    collector = local.collector_ip
    prefix    = split("/", aws_subnet.workload.cidr_block)[1]
  }))
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }
  root_block_device {
    volume_size = 8
    volume_type = "gp3"
    encrypted   = true
  }
  tags = merge(var.tags, { Name = "${var.name}-web" })
  depends_on = [aws_route.outbound_inspection, aws_route.internet, aws_route.inbound_inspection,
    aws_route_table_association.workload, aws_route_table_association.endpoint,
  aws_route_table_association.ingress, aws_iam_role_policy.discovery]
}

# Separate telemetry address: never route the inspected HTTP IP over management.
resource "aws_network_interface" "web" {
  subnet_id               = aws_subnet.workload.id
  private_ip_list         = [local.private_ip, local.collector_ip]
  private_ip_list_enabled = true
  security_groups         = [aws_security_group.web.id]
  tags                    = merge(var.tags, { Name = "${var.name}-web" })
}
resource "aws_eip" "web" {
  domain                    = "vpc"
  network_interface         = aws_network_interface.web.id
  associate_with_private_ip = local.private_ip
  tags                      = merge(var.tags, { Name = "${var.name}-web" })
  depends_on                = [aws_internet_gateway.demo, aws_instance.web]
}
