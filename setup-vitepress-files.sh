#!/usr/bin/env bash
set -euo pipefail

mkdir -p docs/.vitepress
mkdir -p docs/images

cat > package.json <<'EOF'
{
  "name": "aws-ums-hol",
  "version": "1.0.0",
  "description": "AWS UMS Hands-on Lab Guide",
  "private": true,
  "type": "module",
  "scripts": {
    "docs:dev": "vitepress dev docs --host 0.0.0.0",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs --host 0.0.0.0"
  },
  "devDependencies": {
    "vitepress": "latest"
  }
}
EOF

cat > .gitignore <<'EOF'
node_modules
docs/.vitepress/cache
docs/.vitepress/dist
.DS_Store
EOF

cat > docs/.vitepress/config.mts <<'EOF'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AWS UMS HOL',
  description: 'Deploy and Configure FortiManager UMS on AWS',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#2e7cf6' }]
  ],

  themeConfig: {
    siteTitle: 'AWS UMS HOL',

    logo: undefined,

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Lab Guide', link: '/introduction' },
      { text: 'GitHub', link: 'https://github.com/ozanoguz/aws-ums-hol' }
    ],

    sidebar: [
      {
        text: 'Lab Guide',
        collapsed: false,
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Section 1: Log in to AWS', link: '/section-1-aws-login' },
          { text: 'Section 2: Deploy FortiManager', link: '/section-2-deploy-fortimanager' },
          { text: 'Section 3: API Administrator', link: '/section-3-api-admin' },
          { text: 'Section 4: AWS Cloud SDN Connector', link: '/section-4-aws-sdn-connector' },
          { text: 'Section 5: Enable SDN Connector for UMS', link: '/section-5-enable-ums' },
          { text: 'Section 6: FortiFlex Connector', link: '/section-7-fortiflex-connector' },
          { text: 'Section 7: Auto Onboarding Rule', link: '/section-6-auto-onboarding' },
          { text: 'Section 8: Terraform Auto Scaling Group', link: '/section-8-terraform-asg' },
          { text: 'Section 9: Validate Auto Onboarding', link: '/section-9-validate-auto-onboarding' },
          { text: 'Section 10: Scale Auto Scaling Group', link: '/section-10-scale-asg' },
          { text: 'Section 11: Troubleshooting', link: '/section-11-troubleshooting' },
          { text: 'References', link: '/references' }
        ]
      }
    ],

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: 'On this page'
    },

    docFooter: {
      prev: 'Previous',
      next: 'Next'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ozanoguz/aws-ums-hol' }
    ],

    footer: {
      message: 'AWS UMS Hands-on Lab Guide',
      copyright: 'Copyright © 2026'
    }
  }
})
EOF

cat > docs/index.md <<'EOF'
---
layout: home

hero:
  name: AWS UMS HOL
  text: Deploy and Configure FortiManager UMS on AWS
  tagline: Hands-on lab guide for FortiManager, AWS SDN Connector, FortiFlex, Terraform, and UMS auto scaling.
  actions:
    - theme: brand
      text: Start Lab
      link: /introduction
    - theme: alt
      text: View GitHub Repo
      link: https://github.com/ozanoguz/aws-ums-hol

features:
  - title: FortiManager on AWS
    details: Deploy FortiManager-VM in AWS using CloudFormation.
  - title: UMS Integration
    details: Configure AWS SDN Connector and User Managed Scaling integration.
  - title: Terraform ASG
    details: Deploy FortiGate Auto Scaling Group using Terraform modules.
  - title: FortiFlex
    details: Configure FortiFlex connector and Flex VM licensing workflow.
---

EOF

cat > docs/introduction.md <<'EOF'
# 🧪 Lab Guide: Deploy and Configure FortiManager UMS on AWS

## 🔗 Quick Navigation

- [📘 Overview](#-overview)
- [🎯 Lab Objectives](#-lab-objectives)
- [🧭 Lab Topology](#-lab-topology)
- [✅ Prerequisites](#-prerequisites)
- [🏷️ Naming Convention](#️-naming-convention)
- [☁️ Section 1: Log in to AWS](./section-1-aws-login.md)
- [💻 Section 2: Deploying FortiManager in AWS](./section-2-deploy-fortimanager.md)
- [👤 Section 3: Create a FortiManager API Administrator](./section-3-api-admin.md)
- [🔌 Section 4: Create the AWS Cloud SDN Connector](./section-4-aws-sdn-connector.md)
- [🔄 Section 5: Enable the SDN Connector for UMS](./section-5-enable-ums.md)
- [📄 Section 6: Creating a FortiFlex Connector](./section-7-fortiflex-connector.md)
- [🤖 Section 7: Create an Auto Onboarding Rule](./section-6-auto-onboarding.md)
- [🧩 Section 8: Deploying Auto Scaling Group using Terraform](./section-8-terraform-asg.md)
- [🔎 Section 9: Validate Auto Onboarding](./section-9-validate-auto-onboarding.md)
- [📈 Section 10: Scaling the FortiGate Auto Scaling Group from FortiManager](./section-10-scale-asg.md)
- [🛠️ Section 11: Troubleshooting](./section-11-troubleshooting.md)
- [📚 References](./references.md)

---

## 📘 Overview

In this lab, you will configure FortiManager for AWS User Managed Scaling (UMS) integration by following the official Fortinet AWS Administration Guide.

Each student will use an individual AWS account. AWS access keys and secret access keys have already been created by the instructor.

Official Fortinet reference:

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/467817
```

---

## 🎯 Lab Objectives

By the end of this lab, you will be able to:

- 🔐 Log in to your assigned AWS account.
- 🌍 Confirm your AWS identity and region.
- 🚀 Deploy and access FortiManager.
- 👤 Create a FortiManager API administrator.
- 🔌 Configure a FortiManager AWS Cloud SDN connector.
- 📄 Configure a FortiFlex connector in FortiManager.
- 🤖 Create an auto-onboarding rule.
- 🛠️ Deploy auto-scaling in AWS using Terraform.
- 🔎 Validate that FortiManager can discover AWS Auto Scaling resources.
- 📈 Perform scale-out and scale-in using UMS capability.

---

## 🧭 Lab Topology

```text
... will be generated
```

---

## ✅ Prerequisites

Before starting, confirm that you have received the following from your instructor:

| Item | Example / Notes |
|---|---|
| AWS Console URL | `https://console.aws.amazon.com/` |
| AWS account ID | Provided by instructor |
| AWS IAM username | Provided by instructor |
| AWS password | Provided by instructor |
| AWS access key ID | Provided by instructor |
| AWS secret access key | Provided by instructor |
| AWS region | `eu-central-1` |
| FortiManager URL | `https://<fortimanager-public-ip>` |
| FortiFlex API user & password | Provided by instructor |

::: warning Important
Do not share your AWS access key, secret access key, FortiManager password, API key, or license files with other students.
:::

---

## 🏷️ Naming Convention

Use the following naming convention throughout the lab:

```text
student<number>
```

Example:

```text
student01-FortiManager
student01-FMG-API-admin
student01-AWS-SDN-Connector
student01-Onboarding-Rule
student01-Fortiflex-Connector
```

Replace `<number>` with your assigned student number.

---

## 🚀 Start the Lab

Start with:

[☁️ Section 1: Log in to AWS](./section-1-aws-login.md)
EOF

cat > docs/section-1-aws-login.md <<'EOF'
# ☁️ Section 1: Log in to AWS

## 1.1 Open the AWS Console

Open the AWS Console:

```text
https://console.aws.amazon.com/
```

## 1.2 Log in to AWS

Log in using the AWS account information provided by your instructor.

## 1.3 Confirm AWS Region

Confirm that you are in the correct AWS region.

AWS region will be used:

```text
eu-central-1
```

## 1.4 Create a Key Pair

This key pair will be used later throughout the lab.

### 1.4.1 Open EC2

In the AWS Console search bar, search for and open **EC2**.

### 1.4.2 Open Key Pairs

In the left navigation menu, under **Network & Security**, select **Key Pairs**.

### 1.4.3 Create Key Pair

Choose **Create key pair**.

### 1.4.4 Configure the Key Pair

Configure the key pair using the following values:

Example:

```text
Name: student01-key
Key pair type: RSA
Private key file format: .pem
```

### 1.4.5 Create the Key Pair

Choose **Create key pair**.

### 1.4.6 Save the Private Key

Save the downloaded `.pem` file in a secure location.

You will need this file later in the lab.

::: warning Important
Do not lose the private key file. You cannot download it again after creation.
:::
EOF

cat > docs/section-2-deploy-fortimanager.md <<'EOF'
# 💻 Section 2: Deploying FortiManager in AWS

In this section, you will deploy FortiManager-VM in AWS using the Fortinet CSE INTL GitHub repository.

::: warning Important
Before launching the CloudFormation template, you must subscribe to the FortiManager BYOL image in AWS Marketplace. If this step is skipped, the CloudFormation deployment may fail.
:::

Deployment selection:

```text
FortiManager Standalone (New VPC)
```

Repository:

```text
https://github.com/40net-cloud/fortinet-aws-solutions/tree/master/FortiManager
```

This deployment creates a new AWS VPC and deploys FortiManager-VM into that new VPC.

---

## 🎯 Objectives

By the end of this section, you will be able to:

- Launch the FortiManager **New VPC** CloudFormation template.
- Deploy FortiManager in AWS.
- Collect the FortiManager access information.
- Log in to the FortiManager GUI.

---

## ✅ Before You Begin

Confirm that you have the following information from your instructor:

| Item | Example / Notes |
|---|---|
| EC2 key pair | Created in Section 1 |
| Allowed management CIDR | Your public IP or instructor-provided CIDR |
| FortiFlex token ID | Provided by instructor |

::: warning Important
Do not share AWS credentials, FortiManager passwords, API keys, FortiFlex credentials, or license information.
:::

---

## 🔎 2.1 Open the FortiManager Repository

Open the Fortinet CSE INTL FortiManager repository:

```text
https://github.com/40net-cloud/fortinet-aws-solutions/tree/master/FortiManager
```

Locate:

```text
FortiManager Standalone (New VPC)
```

---

## 🚀 2.2 Launch the CloudFormation Stack

1. Under **FortiManager Standalone (New VPC)**, click:

   ```text
   Launch Stack
   ```

2. Confirm that the CloudFormation page opens in:

   ```text
   eu-central-1
   ```

3. Click:

   ```text
   Next
   ```

---

## 🧾 2.3 Configure Stack Parameters

Use the values provided by your instructor.

Suggested values:

| Parameter | Value |
|---|---|
| Stack name | `student<number>-FortiManager` |
| VPC CIDR | Default |
| Public subnet CIDR | Default |
| Availability Zone | AZ in `eu-central-1` |
| FortiManager version | `7.6.x` |
| LicenseType | `FortiFlex` |
| FortiFlexTokenID | Provided by instructor |
| Instance type | Default |
| Management CIDR | Default |
| Key pair | Created EC2 key pair in Section 1 |

---

## ✅ 2.4 Create the Stack

1. Review the stack configuration.

2. Confirm that:

   - Region is `eu-central-1`.
   - Deployment option is **New VPC**.
   - `LicenseType` is set to `FortiFlex`.
   - Key pair is correct.

3. Click:

   ```text
   Create stack
   ```

4. Wait until the stack status becomes:

   ```text
   CREATE_COMPLETE
   ```

---

## 🌐 2.5 Collect FortiManager Access Information

After the stack is complete:

1. Open the EC2 stack, click **Instances**.

2. Find the public IP assigned to FortiManager.

3. Access the FortiManager GUI using the assigned public IP.

   The first password is the EC2 instance ID. You will need to change it after first login.

Example:

```text
FortiManager URL: https://<fortimanager-public-ip>
FortiManager Username: admin
FortiManager Password: <Instance-ID>
```

4. Record the FortiManager access information in your private notes.

::: danger Do Not Share
Do not share FortiManager credentials.
:::
EOF

cat > docs/section-3-api-admin.md <<'EOF'
# 👤 Section 3: Create a FortiManager API Administrator

The API administrator is used by FortiGate devices to request licensing and onboarding from FortiManager.

Follow the steps in the official Fortinet documentation below:

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/902153/creating-an-api-admin-user
```

::: warning Important
Copy the API key and save it in your private lab notes. Keep the credentials for further steps.
:::
EOF

cat > docs/section-4-aws-sdn-connector.md <<'EOF'
# 🔌 Section 4: Create the AWS Cloud SDN Connector

The AWS Cloud SDN connector allows FortiManager to discover AWS resources including Auto Scaling Groups, VPCs, EC2 instances, and other AWS resources.

Follow the steps in the official Fortinet documentation below:

```text
https://docs.fortinet.com/document/fortimanager/7.6.5/administration-guide/390041/creating-aws-fabric-connectors
```

## Suggested Values

| Field | Value |
|---|---|
| Name | `student<number>-AWS-SDN-Connector` |
| Cloud Provider | AWS |
| Authentication Type | Access Key |
| Access Key ID | Provided by instructor |
| Secret Access Key | Provided by instructor |
| Region | `eu-central-1` |

## Save and Test the Connector

1. Save the connector.

2. Test the connector.

3. Right-click and choose:

```text
View Connector Objects
```

::: tip Checkpoint
Confirm that FortiManager can discover AWS objects through the connector.
:::
EOF

cat > docs/section-5-enable-ums.md <<'EOF'
# 🔄 Section 5: Enable the SDN Connector for UMS

Follow the steps in the official Fortinet documentation below:

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/115674
```

## ✅ Checkpoint

Confirm the following:

- The AWS SDN connector is enabled for UMS.
- FortiManager can use the connector for auto-onboarding.
EOF

cat > docs/section-6-auto-onboarding.md <<'EOF'
# 🤖 Section 6: Create an Auto Onboarding Rule

Auto onboarding allows FortiManager to automatically onboard FortiGate instances discovered through the AWS connector.

Follow the steps in the official Fortinet documentation below:

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/670005
```

## Suggested Values

| Field | Value |
|---|---|
| Type | Administrator |
| Administrator | API administrator created earlier |
| Platform | All platforms |
| Device Name Prefix | `student<number>-fgt` |

## Configure the Onboarding Action

Suggested values:

| Field | Value |
|---|---|
| ADOM | `root` |
| Device Group | `Managed FortiGate` |
| Install License | Flex VM |
| Install Configuration | Manual Configuration |
| Policy Package | default |
| Maximum Device Number | 4 |
EOF

cat > docs/section-7-fortiflex-connector.md <<'EOF'
# 📄 Section 7: Creating a FortiFlex Connector

Complete the FortiFlex connector configuration as provided by your instructor.

---

## ⚡ Create a FortiFlex Connector

Complete this option using the provided FortiFlex API credentials.

Follow the steps in the official Fortinet documentation below:

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/729208
```

::: warning Important
You can skip "FortiCloud" related steps. FortiFlex API credentials are already provided by the instructor.
:::

Configure the connector using the official Fortinet documentation below:

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/379795/fortiflex-connector-with-a-specific-configuration-id
```

## Suggested Values

| Field | Value |
|---|---|
| Name | `student<number>-Fortiflex-Connector` |
| API User | Provided by instructor |
| API Password | Provided by instructor |
| Program SN | Provided by instructor |
| Default Config | FGT-UMS-VM04 |

Save the connector.

## ✅ Checkpoint

Confirm the following:

- FortiFlex connector exists.
- Connector test succeeds.
- Auto onboarding rule is configured to use Flex VM licensing.
EOF

cat > docs/section-8-terraform-asg.md <<'EOF'
# 🧩 Section 8: Deploying Auto Scaling Group using Terraform

In this section, you will use **AWS CloudShell** to download the Fortinet AWS Terraform modules and update the Terraform variables so FortiGate-VM instances launched by the Auto Scaling Group can register with FortiManager.

AWS CloudShell is used because it already includes AWS CLI access and Terraform is available in the lab environment.

---

## 🎯 Objectives

By the end of this section, you will be able to:

- Open AWS CloudShell.
- Confirm AWS account and region access.
- Install Terraform in AWS CloudShell.
- Download the Fortinet AWS Terraform module package.
- Edit the `terraform.tfvars` file for an Auto Scaling Group deployment.
- Add FortiManager integration variables.
- Run Terraform initialization and deployment commands.

---

## ✅ Before You Begin

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

if [ "$ARCH" = "x86_64" ]; then
  TF_ARCH="amd64"
elif [ "$ARCH" = "aarch64" ]; then
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
EOF

cat > docs/section-9-validate-auto-onboarding.md <<'EOF'
# 🔎 Section 9: Validate Auto Onboarding

1. In FortiManager, go to:

   ```text
   Device Manager > Device & Groups
   ```

2. Confirm that the relevant AWS Auto Scaling Group or FortiGate instances are visible.

3. Confirm that newly discovered FortiGate devices appear in the correct device group.

4. Confirm license status.

5. Confirm device communication.

## ✅ Checkpoint

Confirm the following:

- FortiGate devices are visible in FortiManager.
- Devices are placed into the expected ADOM and device group.
- Licensing is assigned successfully.
- FortiManager communication with FortiGate is working.
EOF

cat > docs/section-10-scale-asg.md <<'EOF'
# 📈 Section 10: Scaling the FortiGate Auto Scaling Group from FortiManager

In this section, you will scale the FortiGate Auto Scaling Group by using FortiManager.

You will perform two operations:

1. **Scale out** the Auto Scaling Group to increase the number of FortiGate-VM instances.
2. **Scale in** the Auto Scaling Group to reduce the number of FortiGate-VM instances.

---

## 🎯 Objectives

By the end of this section, you will be able to:

- Locate the FortiGate Auto Scaling device group in FortiManager.
- Use **Auto-Scale Instance Count** from FortiManager.
- Scale out the Auto Scaling Group by increasing the instance count.
- Scale in the Auto Scaling Group by decreasing the instance count.
- Verify that FortiGate-VM instances are added or removed.
- Understand that scaled-in FortiGate-VM entries may require manual cleanup in FortiManager.

---

## Part 1: Scale Out the Auto Scaling Group

Scaling out increases the number of FortiGate-VM instances in the Auto Scaling Group.

Follow the steps in the official Fortinet documentation below:

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/767426/scaling-out-the-auto-scaling-group
```

---

## Part 2: Scale In the Auto Scaling Group

Scaling in reduces the number of FortiGate-VM instances in the Auto Scaling Group.

In this example, the Auto Scaling Group will be scaled in from **2 FortiGate-VM instances** to **1 FortiGate-VM instance**.

Follow the steps in the official Fortinet documentation below:

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/389472/scaling-in-the-auto-scaling-group
```
EOF

cat > docs/section-11-troubleshooting.md <<'EOF'
# 🛠️ Section 11: Troubleshooting

## 🧰 Useful FortiManager Debug Commands

Use these only if instructed:

```text
diag debug reset
diag debug application fgfmsd 255
diag debug time enable
diag debug en
diag debug service sys 255
```

To stop debugging:

```text
diag debug disable
diag debug reset
```
EOF

cat > docs/references.md <<'EOF'
# 📚 References

## Fortinet FortiManager Public Cloud AWS Administration Guide

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/467817
```

## Creating an API Admin User

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/902153/creating-an-api-admin-user
```

## Creating AWS Fabric Connectors

```text
https://docs.fortinet.com/document/fortimanager/7.6.5/administration-guide/390041/creating-aws-fabric-connectors
```

## Enabling the SDN Connector for UMS

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/115674
```

## Creating an Auto-Onboarding Rule

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/670005
```

## Creating a FortiFlex Connector

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/729208
```

## FortiFlex Connector with a Specific Configuration ID

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/379795/fortiflex-connector-with-a-specific-configuration-id
```

## Scaling Out the Auto Scaling Group

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/767426/scaling-out-the-auto-scaling-group
```

## Scaling In the Auto Scaling Group

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/389472/scaling-in-the-auto-scaling-group
```
EOF

echo "VitePress files created successfully."
echo
echo "Next commands:"
echo "  npm install"
echo "  npm run docs:dev"
echo
echo "Cloudflare Pages settings:"
echo "  Framework preset: VitePress"
echo "  Build command: npm run docs:build"
echo "  Build output directory: docs/.vitepress/dist"
echo "  Root directory: /"
