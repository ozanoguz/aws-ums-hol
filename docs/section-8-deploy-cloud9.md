# Section 8: Deploy Cloud9 Terraform Workstation

In this section, you will deploy an AWS Cloud9 environment using a CloudFormation template.

This Cloud9 environment will be used as the Terraform workstation for the FortiGate Auto Scaling Group deployment.

The CloudFormation template creates the required Cloud9 environment and supporting AWS resources.

---

### 8.1 Launch the Cloud9 CloudFormation Stack

Click the button below to launch the Cloud9 workstation stack.

[![Launch Stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=https://ftnt-cfts.s3.amazonaws.com/training/Cloud9_CFT.yaml&stackName=Cloud9-New-VPC)

---

### 8.2 Configure Stack Parameters

On the CloudFormation **Quick create stack** page, review the stack details.

Use the following stack name:

```text
Cloud9-New-VPC
```

If your instructor provides a student number, use a unique stack name instead.

Example:

```text
student01-Cloud9-New-VPC
```

Review the parameters shown on the page.

Unless your instructor provides different values, keep the default values from the template.

---

### 8.3 Acknowledge IAM Capabilities

Scroll to the bottom of the page.

Because this template creates IAM resources, select the following acknowledgement:

```text
I acknowledge that AWS CloudFormation might create IAM resources with custom names.
```

Then click:

```text
Create stack
```

---

### 8.4 Wait for Stack Creation

Wait until the stack status becomes:

```text
CREATE_COMPLETE
```

This may take several minutes.

If the stack fails, open the **Events** tab and review the latest error message.

---

### 8.5 Open Cloud9

After the stack reaches `CREATE_COMPLETE`:

1. Open the AWS Console search bar.
2. Search for:

```text
Cloud9
```

3. Open **Cloud9**.
4. Select the Cloud9 environment created by the stack.
5. Click:

```text
Open
```

---

### 8.6 Verify Terraform

Inside the Cloud9 terminal, run:

```bash
terraform version
aws sts get-caller-identity
```

Expected result:

- Terraform version is displayed.
- AWS account identity is displayed.

---

### 8.7 Install Terraform Manually if Needed

If Terraform is not installed yet, run the following command inside the Cloud9 terminal:

```bash
sudo dnf update -y && \
sudo dnf install -y dnf-plugins-core unzip git jq && \
sudo dnf config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo && \
sudo dnf install -y terraform && \
terraform version && \
aws sts get-caller-identity
```

After the command completes, verify Terraform again:

```bash
terraform version
```

---

### Checkpoint

Before continuing, confirm that:

- The Cloud9 environment is open.
- Terraform is installed.
- AWS CLI authentication works.

Run:

```bash
aws sts get-caller-identity
terraform version
```

You are now ready to continue with the Terraform deployment section.

---