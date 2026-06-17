* * *

## Section 8: Deploying Cloud9 Terraform Workstation

In this section, you will deploy an AWS Cloud9 environment using a CloudFormation template.

This Cloud9 environment will be used as the Terraform workstation for the FortiGate Auto Scaling Group deployment.

AWS Cloud9 is used because it provides a browser-based development environment where students can run AWS CLI, Git, and Terraform commands from the same AWS account used for the lab.

* * *

### Objectives

By the end of this section, you will be able to:

  * Launch the Cloud9 New VPC CloudFormation template.
  * Deploy a Cloud9 Terraform workstation.
  * Open the Cloud9 environment.
  * Confirm AWS CLI access from Cloud9.
  * Verify Terraform availability before continuing with the Auto Scaling Group deployment.

* * *

### Before You Begin

Confirm that you have completed the previous sections and have the following information from your instructor:

Item Description Example
AWS Console access Access to the AWS account used for the lab Instructor-provided
AWS region Region where the deployment will run `eu-central-1`
Student number Your assigned student number `student01`

> Important: Use the same AWS region throughout the lab.

AWS region will be used:

    eu-central-1

* * *

### 8.1 Launch the Cloud9 CloudFormation Stack

Open the following CloudFormation quick-create link:

    https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=https://ftnt-cfts.s3.amazonaws.com/training/Cloud9_CFT.yaml&stackName=Cloud9-New-VPC

Alternatively, click the Launch Stack button below:

[![Launch Stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=https://ftnt-cfts.s3.amazonaws.com/training/Cloud9_CFT.yaml&stackName=Cloud9-New-VPC)

Confirm that the CloudFormation page opens in:

    eu-central-1

If needed, change the AWS region from the top-right corner of the AWS Console before creating the stack.

* * *

### 8.2 Configure Stack Parameters

On the CloudFormation Quick create stack page, review the stack details.

Use the following naming convention:

    student<number>-Cloud9-New-VPC

Example:

    student01-Cloud9-New-VPC

If the stack name is already pre-filled as below, replace it with your own student-specific stack name:

    Cloud9-New-VPC

Review the parameters shown on the page.

Unless your instructor provides different values, keep the default values from the template.

* * *

### 8.3 Create the Stack

  1. Review the stack configuration.

  2. Confirm that:

     * Region is `eu-central-1`.
     * Stack name follows the student naming convention.
     * Cloud9 environment name is unique.
     * Default template parameters are kept unless instructed otherwise.

  3. Scroll to the bottom of the page.

  4. If CloudFormation shows an IAM acknowledgement checkbox, select it:

        I acknowledge that AWS CloudFormation might create IAM resources with custom names.

  5. Click:

        Create stack

  6. Wait until the stack status becomes:

        CREATE_COMPLETE

This may take several minutes.

If the stack fails, open the Events tab and review the latest error message.

* * *

### 8.4 Open the Cloud9 Environment

After the stack reaches `CREATE_COMPLETE`:

  1. Open the AWS Console search bar.

  2. Search for and open:

        Cloud9

  3. Find the Cloud9 environment created by the stack.

  4. Click:

        Open

Wait for the Cloud9 IDE to load.

* * *

### 8.5 Confirm AWS CLI Access

Inside the Cloud9 terminal, confirm that AWS CLI access is working.

Run:

    aws sts get-caller-identity

Expected result:

    Account ID is displayed.
    User or role identity is displayed.
    No authentication error is shown.

Confirm that the AWS region is correct.

Run:

    aws configure get region

Expected result:

    eu-central-1

If the region is empty or different, configure it manually:

    aws configure set region eu-central-1

Verify again:

    aws configure get region

* * *

### 8.6 Verify Terraform

Inside the Cloud9 terminal, verify whether Terraform is already installed.

Run:

    terraform version

If Terraform version is displayed, continue to the checkpoint.

Example:

    Terraform v1.x.x

If Terraform is not found, install it manually in the next step.

* * *

### 8.7 Install Terraform Manually if Needed

If Terraform is not installed, run the following commands inside the Cloud9 terminal:

    sudo dnf update -y
    sudo dnf install -y dnf-plugins-core unzip git jq
    sudo dnf config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo
    sudo dnf install -y terraform

Verify Terraform installation:

    terraform version

Expected result:

    Terraform version is displayed.

Confirm AWS CLI access again:

    aws sts get-caller-identity

* * *

### Checkpoint

Before continuing, confirm that:

  * The Cloud9 environment is open.
  * AWS CLI authentication works.
  * AWS region is `eu-central-1`.
  * Terraform is installed.
  * You are ready to run Terraform commands from Cloud9.

Run:

    aws sts get-caller-identity
    aws configure get region
    terraform version

You are now ready to continue with the Terraform deployment section.

* * *