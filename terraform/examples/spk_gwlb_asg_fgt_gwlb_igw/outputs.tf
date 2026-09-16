# Student-facing values needed for FortiManager provisioning.
# Detailed infrastructure remains available through Terraform state and AWS.
output "gwlb_ips" {
  description = "GWLB node private IPs keyed by subnet ID."
  value       = module.security-vpc-gwlb.gwlb_ips
}

output "az_name_map" {
  description = "Availability Zone to GENEVE tunnel name mapping."
  value       = local.az_name_map
}
