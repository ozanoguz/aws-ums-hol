mock_provider "aws" {
  mock_data "aws_vpc" {
    defaults = { cidr_block = "10.0.0.0/16" }
  }
  mock_data "aws_ssm_parameter" {
    defaults = { value = "ami-0123456789abcdef0" }
  }
}
variables {
  name                    = "lab-demo"
  region                  = "eu-central-1"
  availability_zone       = "eu-central-1a"
  allowed_client_cidrs    = ["203.0.113.10/32"]
  security_vpc_id         = "vpc-0123456789abcdef0"
  management_route_tables = { az1 = "rtb-0123456789abcdef0", az2 = "rtb-0123456789abcdef1" }
  management_cidrs        = ["10.0.0.0/24", "10.0.2.0/24"]
  gwlb_service_name       = "com.amazonaws.vpce.eu-central-1.vpce-svc-0123456789abcdef0"
  asg_names               = ["fgt_byol_asg"]
  target_group_arn        = "arn:aws:elasticloadbalancing:eu-central-1:123456789012:targetgroup/demo/0123456789abcdef"
}
run "private_telemetry_and_inspected_http" {
  command = plan
  assert {
    condition = can(yamldecode(templatefile("${path.module}/cloud-init.yaml.tftpl", {
      server    = filebase64("${path.module}/assets/server.py")
      page      = filebase64("${path.module}/assets/index.html")
      config    = base64encode(local.config)
      collector = local.collector_ip
      prefix    = split("/", aws_subnet.workload.cidr_block)[1]
    })))
    error_message = "Rendered cloud-init must be valid YAML."
  }
  assert {
    condition     = local.private_ip != local.collector_ip
    error_message = "HTTP and telemetry must use distinct private IPs."
  }
  assert {
    condition     = alltrue([for r in aws_route.telemetry_to_server : r.destination_cidr_block == "10.50.0.11/32"])
    error_message = "Management routes must target the collector, not the inspected web IP."
  }
  assert {
    condition     = length(aws_route.telemetry_to_server) == 2
    error_message = "Each management subnet route table must get a private telemetry path."
  }
  assert {
    condition     = aws_eip.web.associate_with_private_ip == "10.50.0.10"
    error_message = "Only the HTTP IP should be publicly mapped."
  }
  assert {
    condition     = length(aws_instance.web.user_data_base64) <= 21844
    error_message = "EC2 user data exceeds its limit."
  }
}
