# 🧪 Lab Guide: Deploy and Configure FortiManager UMS on AWS

## 🔗 Quick Navigation

- [📘 Overview](#-overview)
- [🎯 Lab Objectives](#-lab-objectives)
- [🧭 Lab Topology](#-lab-topology)
- [✅ Prerequisites](#-prerequisites)
- [🏷️ Naming Convention](#️-naming-convention)
- [☁️ Section 1: Log in to AWS](#️-section-1-log-in-to-aws)
- [💻 Section 2: Deploying FortiManager in AWS](#-section-2-deploying-fortimanager-in-aws)
  - [🔎 2.1 Open the FortiManager Repository](#-21-open-the-fortimanager-repository)
  - [🚀 2.2 Launch the CloudFormation Stack](#-22-launch-the-cloudformation-stack)
  - [🧾 2.3 Configure Stack Parameters](#-23-configure-stack-parameters)
  - [✅ 2.4 Create the Stack](#-24-create-the-stack)
  - [🌐 2.5 Collect FortiManager Access Information](#-25-collect-fortimanager-access-information)
- [👤 Section 3: Create a FortiManager API Administrator](#-section-3-create-a-fortimanager-api-administrator)
- [🔌 Section 5: Create the AWS Cloud SDN Connector](#-section-5-create-the-aws-cloud-sdn-connector)
- [🔄 Section 5: Enable the SDN Connector for UMS](#-section-6-enable-the-sdn-connector-for-ums)
- [🤖 Section 6: Create an Auto Onboarding Rule](#-section-7-create-an-auto-onboarding-rule)
- [📄 Section 7: Configure Licensing](#-section-8-configure-licensing)
  - [⚡ Create a FortiFlex Connector](#-create-a-fortiflex-connector)
- [🔎 Section 8: Validate Auto Onboarding](#-section-9-validate-auto-onboarding)
- [🛠️ Section 9: Troubleshooting](#️-section-10-troubleshooting)
  - [🧰 Useful FortiManager Debug Commands](#-useful-fortimanager-debug-commands)
- [📤 Submission](#-submission)
- [📚 References](#-references)

## 📘 Overview

In this lab, you will configure FortiManager for AWS User Managed Scaling (UMS) integration by following the official Fortinet AWS Administration Guide.

Each student will use an individual AWS account. AWS access keys and secret access keys have already been created by the instructor.

Official Fortinet reference:

https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/467817

---

## 🎯 Lab Objectives

By the end of this lab, you will be able to:

- 🔐 Log in to your assigned AWS account.
- 🌍 Confirm your AWS identity and region.
- 🚀 Deploy and access FortiManager.
- 👤 Create a FortiManager API administrator.
- 🔌 Configure a FortiManager AWS Cloud SDN connector.
- 🤖 Create an auto-onboarding rule.
- 📄 Configure a FortiFlex connector in FortiManager.
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

> ⚠️ **Important:** Do not share your AWS access key, secret access key, FortiManager password, API key, or license files with other students.

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

## ☁️ Section 1: Log in to AWS

1.1. Open the AWS Console:

   ```text
   https://console.aws.amazon.com/
   ```

1.2. Log in using the AWS account information provided by your instructor.

1.3. Confirm that you are in the correct AWS region.

   AWS region will be used:

   ```text
   eu-central-1
   ```
1.4. Create a key pair.

   This key pair will be used later throughout the lab.

   1.4.1. In the AWS Console search bar, search for and open **EC2**.

   1.4.2. In the left navigation menu, under **Network & Security**, select **Key Pairs**.

   1.4.3. Choose **Create key pair**.

   1.4.4. Configure the key pair using the following values:

      Example:
      ```text
      Name: student01-key
      Key pair type: RSA
      Private key file format: .pem
      ```

   1.4.5. Choose **Create key pair**.

   1.4.6. Save the downloaded `.pem` file in a secure location.

      You will need this file later in the lab.

---

## 💻 Section 2: Deploying FortiManager in AWS

In this section, you will deploy FortiManager-VM in AWS using the Fortinet CSE INTL GitHub repository.

> ⚠️ Important: Before launching the CloudFormation template, you must subscribe to the FortiManager BYOL image in AWS Marketplace. If this step is skipped, the CloudFormation deployment may fail.

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

### 🎯 Objectives

By the end of this section, you will be able to:

- Launch the FortiManager **New VPC** CloudFormation template.
- Deploy FortiManager in AWS.
- Collect the FortiManager access information.
- Log in to the FortiManager GUI.

---

### ✅ Before You Begin

Confirm that you have the following information from your instructor:

| Item | Example / Notes |
|---|---|
| EC2 key pair | Created in Section 1 |
| Allowed management CIDR | Your public IP or instructor-provided CIDR |
| FortiFlex token ID | Provided by instructor |

> ⚠️ Do not share AWS credentials, FortiManager passwords, API keys, FortiFlex credentials, or license information.

---

### 🔎 2.1 Open the FortiManager Repository

Open the Fortinet CSE INTL FortiManager repository:

```text
https://github.com/40net-cloud/fortinet-aws-solutions/tree/master/FortiManager
```

Locate:

```text
FortiManager Standalone (New VPC)
```

---

### 🚀 2.2 Launch the CloudFormation Stack

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

### 🧾 2.3 Configure Stack Parameters

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
| Key pair | Created EC2 key pair in Section 1|

---

### ✅ 2.4 Create the Stack

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

### 🌐 2.5 Collect FortiManager Access Information

After the stack is complete:

1. Open the EC2 stack, click "Instances".

2. Find the public IP assigned to FortiManager.

3. Access the FortiManager GUI using the assigned public IP. The first password is EC2-instance-ID; you will need to change it after first login. 

Example:

```text
FortiManager URL: https://<fortimanager-public-ip>
FortiManager Username: admin
FortiManager Password: <Instance-ID>
```

4. Record the FortiManager access information in your private notes.

Typical values include:

> 🚫 Do not share FortiManager credentials.

---

## 👤 Section 3: Create a FortiManager API Administrator

The API administrator is used by FortiGate devices to request licensing and onboarding from FortiManager.

Follow the steps in the official Fortinet documentation below.

[Creating an API admin user](https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/902153/creating-an-api-admin-user)

> ⚠️ Important Note: Copy the API key and save it in your private lab notes. Keep the credentials for further steps. 

---

## 🔌 Section 4: Create the AWS Cloud SDN Connector

The AWS Cloud SDN connector allows FortiManager to discover AWS resources including Auto Scaling Groups, VPCs, EC2 instances, etc.

Follow the steps in the official Fortinet documentation below.

[Creating AWS fabric connectors](https://docs.fortinet.com/document/fortimanager/7.6.5/administration-guide/390041/creating-aws-fabric-connectors)

   Suggested values:

   | Field | Value |
   |---|---|
   | Name | `student<number>-AWS-SDN-Connector` |
   | Cloud Provider | AWS |
   | Authentication Type | Access Key |
   | Access Key ID | Provided by instructor |
   | Secret Access Key | Provided by instructor |
   | Region | `eu-central-1` |

5. Save the connector.

6. Test the connector.

`Right-click and choose "View Connector Objects"` 

---

## 🔄 Section 5: Enable the SDN Connector for UMS

1. In FortiManager, go to the UMS or Auto Onboarding configuration area as described in the official Fortinet guide.

2. Select the AWS SDN connector created in the previous section.

3. Enable the connector for UMS.

4. Save the configuration.

### ✅ Checkpoint

- The AWS SDN connector is enabled for UMS.
- FortiManager can use the connector for auto onboarding.

---

## 🤖 Section 7: Create an Auto Onboarding Rule

Auto onboarding allows FortiManager to automatically onboard FortiGate instances discovered through the AWS connector.

> ℹ️ Access to the `root` ADOM may be required for this step.

1. Go to:

   ```text
   Device Manager > Device & Groups
   ```

2. Select:

   ```text
   Add Device > Auto Onboarding
   ```

3. Enable:

   ```text
   Allow Auto Onboarding
   ```

4. On the `Onboarding Rule` tab, click:

   ```text
   Create New
   ```

5. Configure the onboarding rule.

   Suggested values:

   | Field | Value |
   |---|---|
   | Type | Administrator |
   | Administrator | API administrator created earlier |
   | Platform | All platforms |
   | Device Name Prefix | `student<number>-fgt` |

6. Configure the onboarding action.

   Suggested values:

   | Field | Value |
   |---|---|
   | ADOM | `root` or assigned ADOM |
   | Device Group | `Managed FortiGates` |
   | Install License | Flex VM |
   | Install Configuration | Manual Configuration or instructor-provided option |
   | Policy Package | Instructor-provided policy package |

7. Click:

   ```text
   OK
   ```

### ✅ Checkpoint

- Auto onboarding is enabled.
- Auto onboarding rule exists.
- Rule uses the API administrator created earlier.
- Rule points to the correct ADOM and device group.

---

## 📄 Section 8: Configure Licensing

Complete the FortiFlex connector configuration as provided by your instructor.

---

### ⚡ Create a FortiFlex Connector

Use this option if your instructor provided FortiFlex API credentials.

1. Go to:

   ```text
   Fabric View > External Connectors
   ```

2. Click:

   ```text
   Create New
   ```

3. Select:

   ```text
   FortiFlex
   ```

4. Configure the connector.

   Suggested values:

   | Field | Value |
   |---|---|
   | Name | `student<number>-Fortiflex-Connector` |
   | API Username | Instructor-provided FortiFlex API username |
   | API Password / Secret | Instructor-provided FortiFlex API secret |
   | Configuration ID | Instructor-provided value, if required |

5. Save the connector.

6. Test the connector.

### ✅ Checkpoint

- FortiFlex connector exists.
- Connector test succeeds.
- Auto onboarding rule is configured to use Flex VM licensing.

---

## 🔎 Section 9: Validate Auto Onboarding

1. In FortiManager, go to:

   ```text
   Device Manager > Device & Groups
   ```

2. Confirm that the relevant AWS Auto Scaling Group or FortiGate instances are visible.

3. Confirm that newly discovered FortiGate devices appear in the correct device group.

4. Confirm license status.

5. Confirm device communication.

### ✅ Checkpoint

- FortiGate devices are visible in FortiManager.
- Devices are placed into the expected ADOM and device group.
- Licensing is assigned successfully.
- FortiManager communication with FortiGate is working.

### 🚦 Important Network Requirement

```text
TCP 541 must be allowed between the FortiGate instances and FortiManager.
```

---

## 🛠️ Section 10: Troubleshooting

### 🧰 Useful FortiManager Debug Commands

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
---

## 📚 References

- Fortinet FortiManager Public Cloud 7.6.0 AWS Administration Guide  
  https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/467817
