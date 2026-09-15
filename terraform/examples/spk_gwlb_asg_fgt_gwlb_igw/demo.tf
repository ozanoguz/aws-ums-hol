# Optional, separate spoke workload. Existing ASG/GWLB resources remain owned by this example.
variable "web_demo" {
  description = "Set to an object to create the live HTTP/syslog demo. Null leaves the lab unchanged. Two-arm/root VDOM only."
  type = object({
    allowed_client_cidrs    = list(string)
    vpc_cidr                = optional(string, "10.50.0.0/16")
    management_route_tables = optional(map(string), {})
  })
  default = null
}

module "web_demo" {
  source = "../../modules/demo/spoke_web"
  count  = var.web_demo == null ? 0 : 1

  name                 = "${local.module_prefix}gwlb-demo"
  region               = var.region
  availability_zone    = var.availability_zones[0]
  vpc_cidr             = var.web_demo.vpc_cidr
  allowed_client_cidrs = var.web_demo.allowed_client_cidrs
  security_vpc_id      = module.security-vpc.vpc_id
  management_cidrs = [for name, subnet in local.subnets : subnet.cidr_block
  if startswith(name, "${local.module_prefix}fgt_login_")]
  management_route_tables = length(var.web_demo.management_route_tables) > 0 ? var.web_demo.management_route_tables : {
    for name, rt in module.security_route_table : name => rt.route_table if startswith(name, "fgt_login")
  }
  asg_names         = [for asg in module.fgt_asg : asg.asg_group.name]
  target_group_arn  = module.security-vpc-gwlb.gwlb_tgp.arn
  gwlb_service_name = module.security-vpc-gwlb.endpoint_service_name
  tags              = var.general_tags
}

output "web_demo" {
  precondition {
    condition     = var.web_demo == null || var.fgt_intf_mode == "2-arm"
    error_message = "The web demo requires two-arm mode (port2 management)."
  }
  value = var.web_demo == null ? null : {
    url                       = module.web_demo[0].url
    collector_private_ip      = module.web_demo[0].private_ip
    instance_id               = module.web_demo[0].instance_id
    spoke_vpc_id              = module.web_demo[0].spoke_vpc_id
    workload_subnet_id        = module.web_demo[0].workload_subnet_id
    fortimanager_cli_template = module.web_demo[0].fortimanager_cli_template
  }
}
