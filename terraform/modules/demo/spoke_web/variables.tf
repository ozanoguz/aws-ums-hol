variable "name" {
  type = string
}
variable "region" {
  type = string
}
variable "availability_zone" {
  type = string
}
variable "vpc_cidr" {
  type    = string
  default = "10.50.0.0/16"
  validation {
    condition     = can(cidrsubnet(var.vpc_cidr, 8, 1))
    error_message = "Supply an IPv4 VPC CIDR with space for two subnets (normally /16)."
  }
}
variable "allowed_client_cidrs" {
  type = list(string)
  validation {
    condition     = length(var.allowed_client_cidrs) > 0 && alltrue([for c in var.allowed_client_cidrs : can(cidrnetmask(c)) && c != "0.0.0.0/0"])
    error_message = "Provide specific IPv4 client CIDRs, such as your public IP /32; do not expose this lab to the whole Internet."
  }
}
variable "security_vpc_id" {
  type = string
}
variable "management_route_tables" {
  description = "Map with plan-time-known keys and route table IDs used by FortiGate management ENIs."
  type        = map(string)
  validation {
    condition     = length(var.management_route_tables) > 0
    error_message = "Provide the route tables used by FortiGate management interfaces for the private syslog return path."
  }
}
variable "management_cidrs" {
  type = list(string)
}
variable "gwlb_service_name" {
  type = string
}
variable "asg_names" {
  type = list(string)
}
variable "target_group_arn" {
  type = string
}
variable "tags" {
  type    = map(string)
  default = {}
}
