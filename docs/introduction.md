# Lab Guide: Deploy and Configure FortiManager UMS on AWS

## Quick Navigation

- [Overview](#overview)
- [Lab Objectives](#lab-objectives)
- [Lab Topology](#lab-topology)
- [Prerequisites](#prerequisites)
- [Naming Convention](#naming-convention)
- [Section 1: Log in to AWS](./section-1-aws-login.md)
- [Section 2: Deploying FortiManager in AWS](./section-2-deploy-fortimanager.md)
- [Section 3: Create a FortiManager API Administrator](./section-3-api-admin.md)
- [Section 4: Create the AWS Cloud SDN Connector](./section-4-aws-sdn-connector.md)
- [Section 5: Enable the SDN Connector for UMS](./section-5-enable-ums.md)
- [Section 6: Creating a FortiFlex Connector](./section-6-fortiflex-connector.md)
- [Section 7: Create an Auto Onboarding Rule](./section-7-auto-onboarding.md)
- [Section 8: Deploying Auto Scaling Group using Terraform](./section-8-terraform-asg.md)
- [Section 9: Validate Auto Onboarding](./section-9-validate-auto-onboarding.md)
- [Section 10: Scaling the FortiGate Auto Scaling Group from FortiManager](./section-10-scale-asg.md)
- [Section 11: Troubleshooting](./section-11-troubleshooting.md)
- [References](./references.md)

---

## Overview

In this lab, you will configure FortiManager for AWS User Managed Scaling (UMS) integration by following the official Fortinet AWS Administration Guide.

Each student will use an individual AWS account. AWS access keys and secret access keys have already been created by the instructor.

[Official Fortinet reference](https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/467817)

---

## Lab Objectives

By the end of this lab, you will be able to:

- Log in to your assigned AWS account.
- Confirm your AWS identity and region.
- Deploy and access FortiManager.
- Create a FortiManager API administrator.
- Configure a FortiManager AWS Cloud SDN connector.
- Create an auto-onboarding rule.
- Configure a FortiFlex connector in FortiManager.
- Deploy auto-scaling in AWS using Terraform.
- Validate that FortiManager can discover AWS Auto Scaling resources.
- Perform scale-out and scale-in using UMS capability.

---

## Lab Topology

```text
... will be generated
```

---

## Prerequisites

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

## Naming Convention

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

## Start the Lab

Start with:

[Section 1: Log in to AWS](./section-1-aws-login.md)
