variables {
  asgs = {
    fgt_byol_asg = {
      asg_min_size         = 2
      asg_desired_capacity = 2
      asg_max_size         = 3
    }
  }
}

run "infrastructure_keeps_asg_empty" {
  command = plan
  variables { deployment_stage = "infrastructure" }
  assert {
    condition = alltrue([
      local.deployment_capacity.fgt_byol_asg.min_size == 0,
      local.deployment_capacity.fgt_byol_asg.desired_capacity == 0,
      local.deployment_capacity.fgt_byol_asg.max_size == 0,
    ])
    error_message = "Infrastructure must prevent FortiGate launches."
  }
}

run "active_restores_configured_capacity" {
  command = plan
  variables { deployment_stage = "active" }
  assert {
    condition = alltrue([
      local.deployment_capacity.fgt_byol_asg.min_size == 2,
      local.deployment_capacity.fgt_byol_asg.desired_capacity == 2,
      local.deployment_capacity.fgt_byol_asg.max_size == 3,
    ])
    error_message = "Active must restore the configured baseline and scale-out limit."
  }
}

run "default_preserves_existing_deployments" {
  command = plan
  assert {
    condition     = var.deployment_stage == "active" && local.deployment_capacity.fgt_byol_asg.desired_capacity == 2
    error_message = "Omitting deployment_stage must not scale existing labs down."
  }
}

run "invalid_stage_rejected" {
  command = plan
  variables { deployment_stage = "typo" }
  expect_failures = [var.deployment_stage]
}
