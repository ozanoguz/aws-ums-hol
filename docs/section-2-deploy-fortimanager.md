# Section 2: Deploying FortiManager in AWS

In this section, you will deploy FortiManager-VM in AWS using the Fortinet CSE INTL GitHub repository.

::: warning Important
Before launching the CloudFormation template, you must subscribe to the FortiManager BYOL image in AWS Marketplace. If this step is skipped, the CloudFormation deployment may fail.
:::

## 2.1 Subscribe to the FortiGate and FortiManager BYOL AMIs

Subscribe to the FortiGate and FortiManager BYOL AMIs before deployment. The following procedure should be completed for both products. Click the links below.

[AWS Marketplace : FortiManager BYOL AMI Listing](https://aws.amazon.com/marketplace/pp/prodview-l6rxheua5mbls?applicationId=AWSMPContessa&ref_=beagle&sr=0-1)

[AWS Marketplace : FortiGate BYOL AMI Listing](https://aws.amazon.com/marketplace/pp?sku=dlaioq277sglm5mw1y1dmeuqa)

Follow the steps below:

1. Click "View purchase options"

```text
View purchase options
```

2. Review the subscription terms and click "Subscribe"

```text
Subscribe
```

Wait for both Marketplace subscriptions to become active.

## 2.2 FortiManager Deployment in AWS

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
| FortiManagerVersion | `7.6.x`; verify the deployed release is 7.6.4 or later before continuing |
| LicenseType | `FortiFlex` |
| FortiFlexTokenID | Provided by instructor |
| CIDRForFMGccess | Instructor-approved management source CIDR; use the actual parameter label in the selected template |
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

1. Open the completed CloudFormation stack and review **Outputs** and **Resources**. Follow its EC2 instance resource to the EC2 console.

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
5. Check the installed firmware version. This automatic-onboarding workflow requires **FortiManager 7.6.4 or later in the 7.6 branch** and **FortiOS 7.6.5 or later**; the Terraform lab selects FortiOS **7.6.7**. The template selects a current AMI within the chosen branch, so verify the actual version instead of assuming any 7.6 release supports the workflow. [Fortinet feature requirements](https://docs.fortinet.com/document/fortimanager/7.6.0/new-features/67082/automatically-onboard-and-register-fortigates-in-fortimanager-7-6-4)

::: danger Do Not Share
Do not share FortiManager credentials.
:::

## 2.8 Enable FortiManager Management of VM Devices

Before continuing with the UMS and Auto Scaling configuration, FortiManager must be configured to allow management of VM devices.

This is required so FortiManager can manage the FortiGate-VM instances that will be deployed later by the Auto Scaling Group.

Log in to the FortiManager CLI via GUI or SSHv2 session, and run the following commands:

```text
config system global
    set fgfm-allow-vm enable
end
```

This enables VM-device management. The API administrator, AWS connector, UMS, FortiFlex and onboarding settings in Sections 3–7 are still required.

Keep the FortiManager EC2 Name tag identifiable, for example `student01-FortiManager`.

## 2.9 Allow FortiGate Registration and Management Traffic

The CloudFormation parameter `CIDRForFMGccess` controls the source range allowed into FortiManager. Setting it to your browser's public IP alone does **not** allow FortiGates in the separate security VPC to register through FortiManager's public IP.

Before Stage 2, open the FortiManager EC2 instance's **Security → Security groups → Inbound rules** and ensure these paths are allowed:

| Traffic | Destination port | Source |
|---|---|---|
| BYOL automatic registration/license request | TCP 443 | FortiGate management public egress addresses |
| IPv4 FGFM management | TCP 541 | FortiGate management public egress addresses |
| Browser administration | TCP 443 | Your browser/instructor management source |

This lab dynamically allocates FortiGate management public IPs as the ASG launches members. For the isolated classroom deployment, permit TCP **443** and **541** from `0.0.0.0/0` so initial onboarding and later scale-out do not depend on manually adding each new IP. Keep SSH access limited to your management source. A restricted deployment needs an instructor-provided stable egress range or private management design instead.

If the template's existing rule already permits all traffic from `0.0.0.0/0`, these ports are already allowed; do not add duplicate rules. Confirm API administrator trusted-host restrictions also permit the FortiGate source addresses.

[Automatic registration uses TCP 443](https://docs.fortinet.com/document/fortimanager/7.6.6/administration-guide/67082/adding-fortigate-devices-using-automatic-onboarding); [FGFM uses TCP 541](https://docs.fortinet.com/document/fortimanager/7.2.0/fortimanager-ports/465971/incoming-ports).
