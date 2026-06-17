# Section 8: Deploying Cloud9 Terraform Workstation

In this section, you will deploy an AWS Cloud9 environment using a CloudFormation template.

This Cloud9 environment will be used as the Terraform workstation for the FortiGate Auto Scaling Group deployment.

AWS Cloud9 is used because it provides a browser-based development environment where students can run AWS CLI, Git, and Terraform commands from the same AWS account used for the lab.

---

## Objectives

By the end of this section, you will be able to:

  * Launch the Cloud9 New VPC CloudFormation template.
  * Deploy a Cloud9 Terraform workstation.
  * Open the Cloud9 environment.
  * Verify/Install Terraform availability before continuing with the Auto Scaling Group deployment.

---

## Before You Begin

Confirm that you have completed the previous sections and have the following information from your instructor:

> Important: Use the same AWS region throughout the lab.

AWS region will be used:

`eu-central-1`

---

### 8.1 Launch the Cloud9 CloudFormation Stack

Click the Launch Stack button below:

[![Launch Stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=https://ftnt-cfts.s3.amazonaws.com/training/Cloud9_CFT.yaml&stackName=Cloud9-New-VPC)

Confirm that the CloudFormation page opens in:

`eu-central-1`

---

### 8.2 Configure Stack Parameters

On the CloudFormation Quick create stack page, review the stack details.

Use the following naming convention:

`student<number>-Cloud9-New-VPC`

Example:

`student01-Cloud9-New-VPC`

Unless your instructor provides different values, keep the default values from the template.

---

### 8.3 Create the Stack

  1. Review the stack configuration.

  2. Confirm that:

     * Region is `eu-central-1`.
     * Stack name follows the student naming convention.
     * Cloud9 environment name is unique.
     * Default template parameters are kept unless instructed otherwise.

  3. Scroll to the bottom of the page.

  4. If CloudFormation shows an IAM acknowledgement checkbox, select it:

        `I acknowledge that AWS CloudFormation might create IAM resources with custom names.`

  5. Click:

   ```text
   Create stack
   ```

  6. Wait until the stack status becomes:

```text
   CREATE_COMPLETE
   ```

This may take several minutes.

---

### 8.4 Open the Cloud9 Environment

After the stack reaches `CREATE_COMPLETE`:

  1. Open the AWS Console search bar.

  2. Search for and open:

```text
Cloud9
```

  3. Find the Cloud9 environment created by the stack.

  4. Click:
  
```text
Open
```

Wait for the Cloud9 IDE to load.

---

### 8.5 Install Terraform

Run the following commands in Cloud9 IDE:

```bash
mkdir -p ~/bin ~/terraform-install
cd ~/terraform-install
```

Set the Terraform version.

```bash
TERRAFORM_VERSION="1.15.6"
```

Detect the Cloud9 CPU architecture.

```bash
ARCH="$(uname -m)"

if [ "$ARCH" = "x86_64" ]; then
  TF_ARCH="amd64"
elif [ "$ARCH" = "aarch64" ]; then
  TF_ARCH="arm64"
else
  echo "Unsupported architecture: $ARCH"
fi

echo "Detected architecture: $ARCH"
echo "Terraform package architecture: $TF_ARCH"
```

Download the Terraform binary package.

```bash
curl -fsSLO "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_${TF_ARCH}.zip"
```

Unzip Terraform.

```bash
unzip -o "terraform_${TERRAFORM_VERSION}_linux_${TF_ARCH}.zip"
```

Move Terraform to your Cloud9 user binary directory.

```bash
mv terraform ~/bin/
chmod +x ~/bin/terraform
```

Add `~/bin` to your `PATH`.

```bash
export PATH="$HOME/bin:$PATH"
```

Make the `PATH` update persistent for future Cloud9 sessions.

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

### Checkpoint

Before continuing, confirm that:

  * The Cloud9 environment is open.
  * AWS region is `eu-central-1`.
  * Terraform is installed.
  * You are ready to run Terraform commands from Cloud9.


You are now ready to continue with the Terraform deployment section.

---