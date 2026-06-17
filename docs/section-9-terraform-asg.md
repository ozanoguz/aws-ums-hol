# Section 9: Deploying Auto Scaling Group using Terraform

In this section, you will use the Cloud9 Terraform workstation deployed in Section 8 to download the Fortinet AWS Terraform modules and update the Terraform variables so FortiGate-VM instances launched by the Auto Scaling Group can register with FortiManager.

Cloud9 is used as the Terraform workstation for this lab. Do not use AWS CloudShell for this section.

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
| FortiFlex refresh token | Refresh token provided by the instructor | Instructor-provided |
| FortiFlex serial number list | FortiFlex VM serial numbers provided by the instructor | Instructor-provided |
| FortiFlex config ID list | FortiFlex config ID provided by the instructor | Instructor-provided |

::: warning Important
Use the same AWS region throughout the lab.

For this lab, the AWS region is:

```text
eu-central-1
```
:::

---

## Step 1: Return to the Cloud9 IDE Home Directory

Before cloning the Fortinet repository, return to your CloudShell home directory.

```bash
cd ~
```


## Step 2: Clone the Fortinet AWS Terraform Modules Repository

Clone the Fortinet AWS Terraform modules repository.

```bash
git clone https://github.com/fortinet/terraform-aws-cloud-modules.git
```

Change into the repository directory.

```bash
cd terraform-aws-cloud-modules
```

---

## Step 3: Go to the Auto Scaling Group Example Directory

The Fortinet documentation uses multiple example directories. Change into that example directory.

```bash
cd examples/spk_gwlb_asg_fgt_gwlb_igw
```

---

## Step 4: Configure the Terraform Variables

Rename the file before editing it.

```bash
mv terraform.tfvars.txt terraform.tfvars
```

Then, edit the `terraform.tfvars` file using `nano`.

```bash
nano terraform.tfvars
```

---

## Values to Configure Before Proceeding

### Root Config Section

| Variable | Description | Value |
|---|---|---|
| access_key | Provided by instructor (Column F) | Example syntax: `"AKIAZRGV3E5YVRVCNJ6T"` |
| secret_key | Provided by instructor (Column G)| Example syntax: `"+Ubf86qMR/cw46hBBt5k3zZVtFAEzPjmuiLkm3Oq"` |
| region | AWS region name | `eu-central-1` |

### VPC Section

| Variable | Description | Value |
|---|---|---|
| vpc_cidr_block | VPC CIDR block for auto scale group | `"10.0.0.0/16"` |
| spoke_cidr_list | Password used for FortiGate registration | `["10.1.0.0/16"]` |
| availability_zones | AWS Availability Zones | `["eu-central-1a", "eu-central-1b"]` |

### Auto Scale Group Section: `fgt_byol_asg` Configuration

| Variable | Description | Value |
|---|---|---|
| fgt_version | FortiGate version | `"7.6.7"` |
| license_type | FortiGate license type | `"byol"` |
| fgt_password | FortiGate password | `"Fortinet2026!"` |
| keypair_name | Name of the key pair | `"student01_KEY"` |
| fortiflex_refresh_token | Provided by instructor | Example: `"EZEuF7at0AujrqiyqyQ9expxw7ZIem"` |
| fortiflex_sn_list | Provided by instructor | `["FGVMELTM26013814", "FGVMELTM26013814"]` |
| fortiflex_configid_list | Provided by instructor | `[80066]` |
| user_conf_file_path | Must be empty | `""` |

### FortiManager Configuration: `fmg_integration` Section

| Variable | Description | Value |
|---|---|---|
| ip | FortiManager public IP address | `["x.x.x.x"]` |
| sn | FortiManager Serial Number | `"FMVMELTM24000254"` |
| autoscale_psksecret | Pre-shared Key | `"fortinet"` |
| api_key | Created in Section 3 | Example: `"15aszaem8ncqedisuwe79rbwizj1waub"` |

### Auto Scale Group Section: `fgt_on_demand_asg` Configuration

| Variable | Description | Value |
|---|---|---|
| fgt_version | FortiGate version | `"7.6.7"` |
| license_type | FortiGate license type | `"on_demand"` |
| fgt_password | FortiGate password | `"Fortinet2026!"` |
| keypair_name | Name of the key pair | `"student01_KEY"` |
| user_conf_file_path | Must be empty | `""` |

### FortiManager Configuration: `fmg_integration` Section

| Variable | Description | Value |
|---|---|---|
| ip | FortiManager public IP address | `["x.x.x.x"]` |
| sn | FortiManager Serial Number | `"FMVMELTM24000254"` |
| autoscale_psksecret | Pre-shared Key | `"fortinet"` |
| fmg_password | FortiManager login password | `"Fortinet2026!"` |
| api_key | Created in Section 3 | Example: `"15aszaem8ncqedisuwe79rbwizj1waub"` |

Save `"terraform.tfvars"` file using following key combination:

```bash
CTRL + X (for Windows users)
or
Command + X (for Mac users)
```

---

## Step 7: Initialize Terraform

Run Terraform initialization from the example directory.

```bash
terraform init
```

Confirm that Terraform downloads the required providers and modules successfully.

---

## Step 8: Review the Terraform Plan

Generate and review the Terraform execution plan.

```bash
terraform plan
```

Review the resources that Terraform will create or modify.

---

## Step 9: Apply the Terraform Configuration

Deploy the infrastructure.

```bash
terraform apply --auto-approve
```

Terraform will create or update the AWS resources.

---

## Step 10: Verify the Deployment

After Terraform completes, verify the following:

1. The Auto Scaling Group is created in AWS.
2. FortiGate-VM instance is launched.
3. FortiGate-VM instance can reach FortiManager.
4. FortiGate-VM instance registered with FortiManager.
5. The FortiManager UMS group receives the expected instance information.
