# Section 2: Deploying FortiManager in AWS

In this section, you will deploy FortiManager-VM in AWS using the Fortinet CSE INTL GitHub repository.

::: warning Important
Before launching the CloudFormation template, you must subscribe to the FortiManager BYOL image in AWS Marketplace. If this step is skipped, the CloudFormation deployment may fail.
:::

## 2.1 Subscribe FortiGate & FortiManager BYOL AMI

You will subscribe FortiGate and FortiManager BYOL AMI before deployment. The following procedure should be completed for both products. Click the links below.

[AWS Marketplace : FortiManager BYOL AMI Listing](https://aws.amazon.com/marketplace/pp/prodview-l6rxheua5mbls?applicationId=AWSMPContessa&ref_=beagle&sr=0-1)

[AWS Marketplace : FortiGate BYOL AMI Listing](https://aws.amazon.com/marketplace/pp/prodview-wory773oau6wq)

Follow the steps below:

1. Click "View purchase options"

```text
View purchase options
```

2. Go down a little and click "Subscribe"

```text
Subscribe
```

Wait couple of minutes for subsccription to be completed.

## 2.2 FortiManager deployment in AWS

Deployment selection:

```text
FortiManager Standalone (New VPC)
```

[GitHub Repository for deploying FortiManager](https://github.com/40net-cloud/fortinet-aws-solutions/tree/master/FortiManager)

This deployment creates a new AWS VPC and deploys FortiManager-VM into that new VPC.

---

## Objectives

By the end of this section, you will be able to:

- Launch the FortiManager **New VPC** CloudFormation template.
- Deploy FortiManager in AWS.
- Collect the FortiManager access information.
- Log in to the FortiManager GUI.

---

## Before You Begin

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

## 2.3 FortiManager Deployment Template

Open the Fortinet CSE INTL FortiManager repository:

[GitHub Repository for deploying FortiManager](https://github.com/40net-cloud/fortinet-aws-solutions/tree/master/FortiManager)

Locate:

```text
FortiManager Standalone (New VPC)
```

---

## 2.4 Launch the CloudFormation Stack

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

## 2.5 Configure Stack Parameters

Use the values provided by your instructor.

Suggested values:

| Parameter | Value |
|---|---|
| Stack name | `student<number>` |
| VPCCIDR | Default |
| PublicSubnet | Default |
| PublicSubnetRouterIP | Default |
| AZForFMG | AZ in `eu-central-1` |
| FMGInstanceType | Default |
| FortiManager version | `7.6.x` |
| LicenseType | `FortiFlex` |
| FortiFlexTokenID | Provided by instructor (Column E) |
| CIDRForFMGccess | Default |
| Key pair | Created EC2 key pair in Section 1 |
| EncryptVolumes | `false` |

---

## 2.6 Create the Stack

1. Review the stack configuration.

2. Confirm that:

   - Region is `eu-central-1`.
   - Deployment option is **New VPC**.
   - `LicenseType` is set to `FortiFlex`.
   - Key pair is correct.

3. Click the box `I acknowledge that AWS CloudFormation might create IAM resources.`

4. Click:

   ```text
   Create stack
   ```

5. Wait until the stack status becomes:

   ```text
   CREATE_COMPLETE
   ```

---

## 2.7 Collect FortiManager Access Information

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

## 2.8 Enable FortiManager Management of VM Devices

Before continuing with the UMS and Auto Scaling configuration, FortiManager must be configured to allow management of VM devices.

This is required so FortiManager can manage the FortiGate-VM instances that will be deployed later by the Auto Scaling Group.

Log in to the FortiManager CLI via GUI or SSHv2 session, and run the following commands:

```shell
config sys global
    set fgfm-allow-vm enable
end
```

After this command is applied, FortiManager is ready to manage FortiGate-VM devices created during the UMS Auto Scaling deployment.