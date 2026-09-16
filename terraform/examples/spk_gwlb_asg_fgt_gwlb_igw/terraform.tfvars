## Note: Please go through all arguments in this file and replace the content with your configuration! This file is just an example.
## "<YOUR-OWN-VALUE>" are parameters that you need to specify your own value.
## BYOL-only lab variant: deploys only fgt_byol_asg and does not create the on-demand ASG.

## Root config
access_key = "AKIAYUY6MFNHVOYU2RG2"
secret_key = "unidYZr+n5R9w8xibxFczalI1DJXRDdEgJdZO3pR"
region     = "eu-central-1" # e.g. "eu-central-1"

## VPC
security_groups = {
  secgrp1 = {
    description = "Security group by Terraform"
    ingress = {
      all_traffic = {
        from_port   = "0"
        to_port     = "0"
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
      }
    }
    egress = {
      all_traffic = {
        from_port   = "0"
        to_port     = "0"
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
      }
    }
  }
}

vpc_cidr_block     = "10.0.0.0/16"                      # e.g. "10.0.0.0/16"
spoke_cidr_list    = ["10.1.0.0/16"]                    # e.g. ["10.1.0.0/16"]
availability_zones = ["eu-central-1a", "eu-central-1b"] # e.g. ["eu-central-1a", "eu-central-1b"]

## Auto scale group
# BYOL-only ASG for hands-on lab students.
fgt_intf_mode = "2-arm"
asgs = {
  fgt_byol_asg = {
    template_name               = "fgt_asg_template"
    fgt_version                 = "7.6.7"
    license_type                = "byol"
    fgt_password                = "Fortinet2026!" # e.g. "Fortinet2026!"
    keypair_name                = "student00_key" # Keypair should be created manually
    lic_folder_path             = "./license"
    enable_fgt_system_autoscale = true
    intf_security_group = {
      login_port    = "secgrp1"
      internal_port = "secgrp1"
    }
    user_conf_file_path = "" # e.g. "./fgt_config.conf"
    asg_max_size        = 1
    asg_min_size        = 1
    # asg_desired_capacity = 1
    create_dynamodb_table = true
    dynamodb_table_name   = "fgt_asg_track_table"
    ## For UMS feature:
    fmg_integration = {
      ip           = "18.153.220.94"
      sn           = "FMVMELTM26001594"
      fgt_lic_mgmt = "fmg"
      ums = {
        autoscale_psksecret = "Fortinet2026!" # e.g. "Fortinet2026!"
        hb_interval         = 10
        fmg_password        = "Fortinet2026!" # e.g. "Fortinet2026!" Use only for PAYG type of FOS
        api_key             = "p1ack7ga5s6baxpytks6ebm5pbg934if"
      }
    }
    metadata_options = {
      http_endpoint          = "enabled"
      instance_metadata_tags = "enabled"
    }
  }
}

## Cloudwatch Alarm
# No CloudWatch scaling alarms are needed for this BYOL-only lab variant.
# The hybrid example alarms target scale policies on fgt_on_demand_asg, which is intentionally removed here.
cloudwatch_alarms = {}

## Gateway Load Balancer
enable_cross_zone_load_balancing = true

## Tag
general_tags = {
  "purpose" = "ASG_TEST"
}
