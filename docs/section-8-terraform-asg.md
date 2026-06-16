# Section 8: Deploying Auto Scaling Group using Terraform

In this section, you will use **AWS CloudShell** to download the Fortinet AWS Terraform modules and update the Terraform variables so FortiGate-VM instances launched by the Auto Scaling Group can register with FortiManager.

AWS CloudShell is used because it already includes AWS CLI access and Terraform is available in the lab environment.

---

## Objectives

By the end of this section, you will be able to:

- Open AWS CloudShell.
- Confirm AWS account and region access.
- Install Terraform in AWS CloudShell.
- Download the Fortinet AWS Terraform module package.
- Edit the `terraform.tfvars` file for an Auto Scaling Group deployment.
- Add FortiManager integration variables.
- Run Terraform initialization and deployment commands.

---

## Before You Begin

Confirm that you have the following information from your instructor:

| Item | Description | Example |
|---|---|---|
| AWS Console access | Access to the AWS account used for the lab | Instructor-provided |
| AWS region | Region where the deployment will run | `eu-central-1` |
| FortiManager IP address | Public or private IP address of FortiManager | `x.x.x.x` |
| FortiManager serial number | FortiManager VM serial number | `FMG-VMXXXXXXXXXX` |
| FortiManager registration password | Password used for FortiGate registration | `Fortinet2026!` |
| FortiManager API admin key | API key generated from FortiManager | Created in Section 3 |

---

## Step 1: Open AWS CloudShell

1. Log in to the AWS Management Console.
2. Confirm that you are in the correct AWS region:

   ```text
   eu-central-1
   ```

3. Click the **CloudShell** icon in the top-right corner of the AWS Console.

The CloudShell icon looks like a terminal prompt.

```text
>_
```

Wait for CloudShell to start.

---

## Step 3: Install Terraform in AWS CloudShell

Terraform may not be installed by default in AWS CloudShell. Install Terraform into your CloudShell home directory.

Run the following commands in CloudShell:

```bash
mkdir -p ~/bin ~/terraform-install
cd ~/terraform-install
```

Set the Terraform version.

```bash
TERRAFORM_VERSION="1.15.6"
```

Detect the CloudShell CPU architecture.

```bash
ARCH="$(uname -m)"

if ["$ARCH" = "x86_64"]; then
  TF_ARCH="amd64"
elif ["$ARCH" = "aarch64"]; then
  TF_ARCH="arm64"
else
  echo "Unsupported architecture: $ARCH"
  exit 1
fi
```

Download the Terraform binary package.

```bash
curl -fsSLO "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_${TF_ARCH}.zip"
```

Unzip Terraform.

```bash
unzip -o "terraform_${TERRAFORM_VERSION}_linux_${TF_ARCH}.zip"
```

Move Terraform to your CloudShell user binary directory.

```bash
mv terraform ~/bin/
chmod +x ~/bin/terraform
```

Add `~/bin` to your `PATH`.

```bash
export PATH="$HOME/bin:$PATH"
```

Make the `PATH` update persistent for future CloudShell sessions.

```bash
grep -qxF 'export PATH="$HOME/bin:$PATH"' ~/.bashrc || echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
```

Verify Terraform installation.

```bash
terraform version
```

Expected result:

```text
Terraform v1.15.6
```

::: tip Note
Terraform is installed under your CloudShell home directory. If you switch AWS regions or use a different CloudShell environment, you may need to repeat this installation step.
:::

---

## Step 4: Return to the CloudShell Home Directory

Before cloning the Fortinet repository, return to your CloudShell home directory.

```bash
cd ~
```

---

## Step 5: Clone the Fortinet AWS Terraform Modules Repository

In CloudShell, clone the Fortinet AWS Terraform modules repository.

```bash
git clone https://github.com/fortinet/terraform-aws-cloud-modules.git
```

Change into the repository directory.

```bash
cd terraform-aws-cloud-modules
```

---

## Step 6: Go to the Auto Scaling Group Example Directory

The Fortinet documentation uses multiple example directories. Change into that example directory.

```bash
cd examples/spk_gwlb_asg_fgt_gwlb_igw
```

---

## Step 7: Configure the Terraform Variables

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
| access_key | Provided by instructor | Example syntax: `"AKIAZRGV3E5YVRVCNJ6T"` |
| secret_key | Provided by instructor | Example syntax: `"+Ubf86qMR/cw46hBBt5k3zZVtFAEzPjmuiLkm3Oq"` |
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
| fortiflex_refresh_token | Provided by instructor | `"EZEuF7at0AujrqiyqyQ9expxw7ZIem"` |
| fortiflex_sn_list | Provided by instructor | `["FGVMELTM26013814", "FGVMELTM26013814"]` |
| fortiflex_configid_list | Provided by instructor | `[80066]` |

### FortiManager Configuration: `fmg_integration` Section

| Variable | Description | Value |
|---|---|---|
| ip | FortiManager public IP address | `["x.x.x.x"]` |
| sn | FortiManager Serial Number | `"FMVMELTM24000254"` |
| fgt_password | FortiGate password | `"Fortinet2026!"` |
| autoscale_psksecret | Pre-shared Key | `"fortinet"` |
| fmg_password | Pre-shared Key | `"fortinet"` |
| api_key | Created in Section 3 | `"15aszaem8ncqedisuwe79rbwizj1waub"` |

### Auto Scale Group Section: `fgt_on_demand_asg` Configuration

| Variable | Description | Value |
|---|---|---|
| fgt_version | FortiGate version | `"7.6.7"` |
| license_type | FortiGate license type | `"on_demand"` |
| fgt_password | FortiGate password | `"Fortinet2026!"` |
| keypair_name | Name of the key pair | `"student01_KEY"` |

### FortiManager Configuration: `fmg_integration` Section

| Variable | Description | Value |
|---|---|---|
| ip | FortiManager public IP address | `["x.x.x.x"]` |
| sn | FortiManager Serial Number | `"FMVMELTM24000254"` |
| fgt_password | FortiGate password | `"Fortinet2026!"` |
| autoscale_psksecret | Pre-shared Key | `"fortinet"` |
| fmg_password | Pre-shared Key | `"fortinet"` |
| api_key | Created in Section 3 | `"15aszaem8ncqedisuwe79rbwizj1waub"` |

---

## Step 8: Initialize Terraform

Run Terraform initialization from the example directory.

```bash
terraform init
```

Confirm that Terraform downloads the required providers and modules successfully.

---

## Step 9: Review the Terraform Plan

Generate and review the Terraform execution plan.

```bash
terraform plan
```

Review the resources that Terraform will create or modify.

---

## Step 10: Apply the Terraform Configuration

Deploy the infrastructure.

```bash
terraform apply --auto-approve
```

Terraform will create or update the AWS resources.

---

## Step 11: Verify the Deployment

After Terraform completes, verify the following:

1. The Auto Scaling Group is created in AWS.
2. FortiGate-VM instance is launched.
3. FortiGate-VM instance can reach FortiManager.
4. FortiGate-VM instance registered with FortiManager.
5. The FortiManager UMS group receives the expected instance information.
