# Section 8: Deploy Cloud9 Terraform Workstation

In this section, you will deploy an AWS Cloud9 environment using a CloudFormation template.

This Cloud9 environment will be used as the Terraform workstation for the FortiGate Auto Scaling Group deployment.

The CloudFormation template creates the required Cloud9 environment and supporting AWS resources.

### 8.1 Launch the Cloud9 CloudFormation Stack

Click the button below to launch the Cloud9 workstation stack.

[![Launch Stack](https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/review?templateURL=https%3A%2F%2Fftnt-cfts.s3.amazonaws.com%2Ftraining%2FCloud9_CFT.yaml&stackName=Cloud9-New-VPC)

If the button does not work, open the following link manually:

```text

Auto onboarding allows FortiManager to automatically onboard FortiGate instances discovered through the AWS connector.

Follow the steps in the official Fortinet documentation below:

[Create an Auto Onboarding Rule](https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/670005)

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
