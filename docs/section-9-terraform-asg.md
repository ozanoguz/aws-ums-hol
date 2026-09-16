# Section 9: Deploying Auto Scaling Group using Terraform

In this section, you will use the Cloud9 Terraform workstation deployed in Section 8 to download the Fortinet AWS Terraform modules and update the Terraform variables so FortiGate-VM instances launched by the Auto Scaling Group can register with FortiManager.

Use the Cloud9 workstation prepared in Section 8 for the commands below. Keep the Terraform configuration and state in that same workspace throughout the lab.

---

## Objectives

By the end of this section, you will be able to:

- Open the Cloud9 Terraform workstation.
- Confirm AWS account and region access.
- Download the Fortinet AWS Terraform module package.
- Edit the `terraform.tfvars` file for an Auto Scaling Group deployment.
- Add FortiManager integration variables.
- Run Terraform initialization and deployment commands from Cloud9.
- Verify that the Auto Scaling Group deployment is created successfully.

---

## Before You Begin

Confirm that you have completed the previous sections and have the following information from your instructor:

| Item | Description | Example |
|---|---|---|
| Cloud9 environment | Cloud9 Terraform workstation deployed in Section 8 | `student01-Cloud9-New-VPC` |
| AWS Console access | Access to the AWS account used for the lab | Instructor-provided |
| AWS region | Region where the deployment will run | `eu-central-1` |
| FortiManager IP address | Public or private IP address of FortiManager | `x.x.x.x` |
| FortiManager serial number | FortiManager VM serial number | `FMG-VMXXXXXXXXXX` |
| FortiManager registration password | Password used for FortiGate registration | `Fortinet2026!` |
| FortiManager API admin key | API key generated from FortiManager | Created in Section 3 |

::: warning Important
Use the same AWS region throughout the lab.

For this lab, the AWS region is:

```text
eu-central-1
```
:::

---

## Step 1: Return to the Cloud9 IDE Home Directory

Before cloning the Fortinet repository, return to your Cloud9 home directory.

```bash
cd ~
```


## Step 2: Clone the Fortinet AWS Terraform Modules Repository

Clone the Fortinet AWS Terraform modules repository.

```bash
mkdir -p ~/environment
cd ~/environment
git clone https://github.com/ozanoguz/aws-ums-hol.git
```
---

## Step 3: Go to the Auto Scaling Group Example Directory

Use this lab repository and the following example; the upstream examples do not include all of this lab's web-demo additions.

```bash
cd aws-ums-hol/terraform/examples/spk_gwlb_asg_fgt_gwlb_igw
```

---

## Step 4: Configure the Terraform Variables

Edit the `terraform.tfvars` file using `nano`.

```bash
nano terraform.tfvars
```

---

## Suggested Values to Configure Before Proceeding

### Root Config Section (Suggested Values)

| Variable | Description | Value |
|---|---|---|
| access_key | Provided by instructor | Example syntax, use your own value: `"<YOUR_AWS_ACCESS_KEY_ID>"` |
| secret_key | Provided by instructor | Example syntax, use your own value: `"<YOUR_AWS_SECRET_ACCESS_KEY>"` |
| region | AWS region name | `"eu-central-1"` |

### VPC Section (Suggested Values)

| Variable | Description | Value |
|---|---|---|
| vpc_cidr_block | VPC CIDR block for auto scale group | `"10.0.0.0/16"` |
| spoke_cidr_list | CIDRs of the existing spoke VPCs | `["10.1.0.0/16"]` |
| availability_zones | AWS Availability Zones | `["eu-central-1a", "eu-central-1b"]` |

### Auto Scale Group Section: `fgt_byol_asg` Configuration

| Variable | Description | Value |
|---|---|---|
| fgt_version | FortiGate version | Already configured for you `"7.6.7"` |
| license_type | FortiGate license type | `"byol"` |
| fgt_password | FortiGate password | Example syntax: `"Fortinet2026!"` |
| keypair_name | Name of the key pair | Example syntax, use your key pair name: `"student01-key"` |
| user_conf_file_path | Must be empty | Already configured for you `""` |
| enable_fgt_system_autoscale | Disable legacy autoscale handling because FortiManager manages UMS | `false` |
| asg_min_size | Minimum capacity for the two-node baseline | `2` |
| asg_desired_capacity | Initial FortiGate instance count; uncomment/add this field | `2` |
| asg_max_size | Allow the later three-node scale-out exercise | `3` |

### FortiManager Configuration: `fmg_integration` Section

| Variable | Description | Value |
|---|---|---|
| ip | FortiManager public IP address | `"FORTIMANAGER PUBLIC IP"` |
| sn | FortiManager Serial Number | `"FMVMELTMXXXXXXXX"` |
| autoscale_psksecret | Pre-shared Key | `"Fortinet2026!"` |
| fmg_password | FortiManager password | `"Fortinet2026!"` |
| api_key | Created in Section 3 | `"<YOUR_FORTIMANAGER_API_KEY>"` |

Replace the example values below with your own FortiManager details. This block is nested inside `asgs.fgt_byol_asg`:

```hcl
fmg_integration = {
  ip           = "<YOUR_FORTIMANAGER_IP>"
  sn           = "<YOUR_FORTIMANAGER_SERIAL>"
  fgt_lic_mgmt = "fmg"
  ums = {
    autoscale_psksecret = "<YOUR_AUTOSCALE_PSK>"
    hb_interval         = 10
    fmg_password        = "<YOUR_FORTIMANAGER_PASSWORD>" # Used for PAYG; keep schema for this BYOL lab
    api_key             = "<YOUR_FORTIMANAGER_API_KEY>"
  }
}
```

Keep `fgt_intf_mode = "2-arm"` and `enable_cross_zone_load_balancing = true`. The supplied `web_demo` block already enables public HTTP/80 on a separate `10.50.0.0/16` demo spoke; no browser-IP restriction needs to be added. Syslog uses private peering.

Check the capacity fields above even if the file contains values from an earlier run: a maximum of `1` prevents the scale-out exercise. Confirm your FortiFlex configuration has enough capacity/entitlements for three FortiGates.

Save in nano with **Ctrl+O**, press **Enter**, then **Ctrl+X**. Use **Control**, not Command, on a Mac.

---

## Step 5: Initialize Terraform

Run Terraform initialization from the example directory.

```bash
terraform init
```

Confirm that Terraform downloads the required providers and modules successfully.

---

## Step 6: Review the Terraform Plan

Generate and review the Terraform execution plan.

```bash
terraform plan -out=lab.plan
```

Review the resources that Terraform will create or modify. Confirm the plan contains the two-instance baseline, maximum capacity three, and the web-demo resources. If you edit the configuration afterward, regenerate the saved plan.

---

## Step 7: Apply the Terraform Configuration

Deploy the infrastructure.

```bash
terraform apply lab.plan
```

Terraform will create or update the AWS resources.

---

## Step 8: Verify the Deployment

After Terraform completes, verify the following:

1. The Auto Scaling Group is created in AWS.
2. Two FortiGate-VM instances are launched.
3. Both FortiGate-VM instances can reach FortiManager.
4. Both FortiGate-VM instances register with FortiManager.
5. The FortiManager UMS group receives the expected instance information.


Record the demo output for the next section:

```bash
terraform output -json web_demo
```

The web URL may remain unavailable until Section 10 installs the inspection and outbound policies. Keep your Terraform state files; subsequent changes must use this same deployment state.

## Next: Configure Inspection and the Web Demo

Registration alone does not configure GENEVE inspection or the demo firewall policies. Continue to [Section 10: Configure FortiManager Templates and the Policy Package](./section-10-fortimanager-configuration.md). That section provides both scripts and installs them on existing devices before enabling them for future onboarding.
