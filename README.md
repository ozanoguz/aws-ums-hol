# 🧪 Lab Guide: Deploy and Configure FortiManager UMS on AWS

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

1. Open the AWS Console:

   ```text
   https://console.aws.amazon.com/
   ```

2. Log in using the AWS account information provided by your instructor.

3. Confirm that you are in the correct AWS region.

   AWS region will be used:

   ```text
   eu-central-1
   ```

---

## 💻 Section 2: Configure AWS CLI Credentials

This section is optional if the lab is performed only from the AWS Console. Complete it if your instructor requires AWS CLI access.

### 🔎 2.1 Install or Confirm AWS CLI

Run:

```bash
aws --version
```

Expected result:

```text
aws-cli/2.x.x ...
```

### 🔑 2.2 Configure AWS CLI

Run:

```bash
aws configure
```

Enter the values provided by your instructor:

```text
AWS Access Key ID [None]: <your-access-key-id>
AWS Secret Access Key [None]: <your-secret-access-key>
Default region name [None]: eu-central-1
Default output format [None]: json
```

### 🪪 2.3 Verify AWS Identity

Run:

```bash
aws sts get-caller-identity
```

Expected result:

```json
{
  "UserId": "...",
  "Account": "...",
  "Arn": "arn:aws:iam::<account-id>:user/<username>"
}
```

### ✅ Checkpoint

- Confirm that the returned AWS account ID matches the account assigned to you.
- If the account ID is incorrect, stop and ask the instructor for help.

---

## 🖥️ Section 3: Access FortiManager

1. Open a browser.

2. Go to the FortiManager URL provided by your instructor:

   ```text
   https://<fortimanager-public-ip-or-fqdn>
   ```

3. Accept the browser certificate warning if this is a lab self-signed certificate.

4. Log in using the FortiManager credentials provided by your instructor.

5. Confirm that you can access the FortiManager GUI.

### ✅ Checkpoint

- You should be able to see the FortiManager dashboard.
- You should have permission to access the `root` ADOM or the ADOM assigned by your instructor.

---

## 👤 Section 4: Create a FortiManager API Administrator

The API administrator is used by FortiGate devices to request licensing and onboarding from FortiManager.

1. In FortiManager, go to:

   ```text
   System Settings > Admin > Administrators
   ```

2. Click:

   ```text
   Create New
   ```

3. Configure the administrator.

   Suggested values:

   | Field | Value |
   |---|---|
   | User Name | `student-<number>-api-admin` |
   | Type | API Admin |
   | Admin Profile | As instructed |
   | Trusted Hosts | Instructor-provided source networks, if required |
   | ADOM Access | `root` or assigned ADOM |

4. Generate the API key.

5. Copy the API key and save it in your private lab notes.

   Example private note format:

   ```text
   FortiManager API Admin: student01-FMG-API-admin
   FortiManager API Key: <paste-key-here>
   ```

6. Do not commit the API key to GitHub.

### ✅ Checkpoint

- API administrator exists.
- API key has been generated and saved securely.
- API key is not shared with other students.

---

## 🔌 Section 5: Create the AWS Cloud SDN Connector

The AWS Cloud SDN connector allows FortiManager to discover AWS resources such as Auto Scaling Groups.

1. In FortiManager, go to:

   ```text
   Fabric View > External Connectors
   ```

2. Click:

   ```text
   Create New
   ```

3. Select the AWS Cloud SDN connector option.

4. Configure the connector.

   Suggested values:

   | Field | Value |
   |---|---|
   | Name | `student<number>-AWS-SDN-Connector` |
   | Cloud Provider | AWS |
   | Authentication Type | Access Key |
   | Access Key ID | Your assigned AWS access key ID |
   | Secret Access Key | Your assigned AWS secret access key |
   | Region | `eu-central-1` |

5. Save the connector.

6. Test the connector.

7. Validate that FortiManager can see AWS resources by creating or testing a dynamic address object from the SDN connector.

### ✅ Checkpoint

- AWS SDN connector is created.
- Connector test succeeds.
- AWS resources are visible from FortiManager.

### 🛠️ Troubleshooting

- If the connector test fails, verify the access key and secret key.
- Confirm that the AWS region is correct.
- Confirm that the IAM permissions assigned by the instructor allow FortiManager to read Auto Scaling and EC2 resources.
- Confirm that your AWS account contains the expected lab resources.

---

## 🔄 Section 6: Enable the SDN Connector for UMS

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

### ❌ Issue: AWS resources are not visible in FortiManager

Possible causes:

- Incorrect AWS access key or secret key.
- Wrong AWS region.
- Insufficient IAM permissions.
- AWS Auto Scaling Group does not exist.
- SDN connector is not enabled for UMS.

Actions:

1. Re-test the AWS SDN connector.
2. Confirm the AWS region.
3. Verify AWS identity:

   ```bash
   aws sts get-caller-identity
   ```

4. Confirm that EC2 and Auto Scaling resources exist:

   ```bash
   aws ec2 describe-instances
   aws autoscaling describe-auto-scaling-groups
   ```

5. Ask the instructor to verify IAM permissions.

---

### ⚠️ Issue: Auto Scaling Group appears, but FortiGate does not onboard

Possible causes:

- Auto onboarding rule is not enabled.
- Wrong API administrator selected.
- API key was not generated or was lost.
- FortiGate cannot reach FortiManager.
- TCP 541 is blocked.

Actions:

1. Confirm that auto onboarding is enabled.
2. Confirm that the onboarding rule uses the correct API administrator.
3. Confirm that the FortiGate security group allows communication to FortiManager.
4. Confirm that FortiManager security group allows TCP 541 from FortiGate.
5. Review FortiManager logs.

---

### 🪪 Issue: License assignment fails

Possible causes:

- FortiFlex connector credentials are incorrect.
- FortiFlex entitlement is missing.
- Auto onboarding rule points to the wrong license method.
- Flex VM licensing is not available for the selected configuration.

Actions:

1. Test the FortiFlex connector.
2. Confirm that the auto onboarding rule uses Flex VM licensing.
3. Confirm that the FortiFlex configuration ID is correct.
4. Ask the instructor to verify license availability.

---

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

## 🧾 Section 11: Lab Completion Checklist

Before submitting, confirm the following:

- [ ] 🔐 I logged in to my assigned AWS account.
- [ ] 💻 I configured or verified AWS CLI access.
- [ ] 🪪 I confirmed my AWS identity with `aws sts get-caller-identity`.
- [ ] 🖥️ I logged in to FortiManager.
- [ ] 👤 I created a FortiManager API administrator.
- [ ] 🔑 I generated and securely saved the API key.
- [ ] 🔌 I created an AWS Cloud SDN connector.
- [ ] ✅ I tested the AWS SDN connector.
- [ ] 🔄 I enabled the SDN connector for UMS.
- [ ] 🤖 I created an auto onboarding rule.
- [ ] 📄 I configured FortiFlex licensing.
- [ ] 🚦 I confirmed that TCP 541 is allowed between FortiGate and FortiManager.
- [ ] 🔎 I validated that FortiGate devices or AWS Auto Scaling resources are visible.
- [ ] 📈 I performed scale-out and scale-in validation using UMS.
- [ ] 🧹 I completed cleanup steps if instructed.

---

## 🧹 Section 12: Cleanup

Only perform cleanup if instructed.

### 🗑️ 12.1 Remove FortiManager Lab Objects

Delete or disable the following objects created during the lab:

- Auto onboarding rule
- AWS Cloud SDN connector
- FortiFlex connector
- API administrator

### 🔐 12.2 Remove Local AWS CLI Credentials

If this was a temporary lab workstation, remove local AWS credentials.

Linux/macOS:

```bash
rm -f ~/.aws/credentials
rm -f ~/.aws/config
```

Windows PowerShell:

```powershell
Remove-Item "$env:USERPROFILE\.aws\credentials" -Force
Remove-Item "$env:USERPROFILE\.aws\config" -Force
```

### 🧪 12.3 Confirm No Secrets Were Committed

If you used Git, run:

```bash
git status
```

Confirm that no files containing the following were committed:

- AWS access key ID
- AWS secret access key
- FortiManager API key
- FortiManager admin password
- FortiFlex credentials
- License files

---

## 📤 Submission

Submit the following to your instructor:

| Item | Required |
|---|---|
| Screenshot of AWS identity verification | Yes |
| Screenshot of FortiManager AWS SDN connector test | Yes |
| Screenshot of auto onboarding rule | Yes |
| Screenshot of FortiFlex connector | Yes |
| Screenshot of onboarded FortiGate or discovered ASG | Yes |
| Screenshot or notes from scale-out / scale-in validation | Yes |
| Notes about any issues encountered | Yes |

> 🚫 **Do not submit secrets, passwords, API keys, access keys, or license files.**

---

## 📚 References

- Fortinet FortiManager Public Cloud 7.6.0 AWS Administration Guide  
  https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/467817

- AWS CLI Configuration  
  https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html
