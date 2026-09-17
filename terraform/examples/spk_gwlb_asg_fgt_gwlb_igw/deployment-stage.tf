# Keep existing deployments active unless infrastructure-only is explicitly selected.
variable "deployment_stage" {
  description = "infrastructure creates the lab with empty ASGs; active uses the configured ASG capacities. Never switch a running lab back to infrastructure unless you intend to remove its FortiGates."
  type        = string
  default     = "active"

  validation {
    condition     = contains(["infrastructure", "active"], var.deployment_stage)
    error_message = "deployment_stage must be infrastructure or active."
  }
}

locals {
  deployment_capacity = {
    for name, asg in var.asgs : name => {
      min_size         = var.deployment_stage == "infrastructure" ? 0 : asg.asg_min_size
      max_size         = var.deployment_stage == "infrastructure" ? 0 : asg.asg_max_size
      desired_capacity = var.deployment_stage == "infrastructure" ? 0 : lookup(asg, "asg_desired_capacity", null)
    }
  }
}

output "deployment_stage" {
  description = "Current deployment stage. Configure FortiManager before changing infrastructure to active."
  value       = var.deployment_stage
}
