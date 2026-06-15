```markdown
---
layout: page
---

<p align="center">
  <img
    src="/images/xperts.png"
    alt="Fortinet EMEA XPERTS26 Madrid"
    style="width: 100%; max-width: 1200px; border-radius: 12px;"
  />
</p>

# AWS UMS HOL

## Deploy and Configure FortiManager UMS on AWS

Hands-on lab guide for FortiManager, AWS SDN Connector, FortiFlex, Terraform, and UMS auto scaling.

<p>
  <a href="/introduction.html">
    <button style="padding: 10px 18px; font-size: 16px; cursor: pointer;">
      Start Lab
    </button>
  </a>
</p>

---

## Lab Guide Overview

This lab guide walks you through deploying and configuring FortiManager UMS on AWS.

You will complete the following major tasks:

- Deploy FortiManager-VM in AWS.
- Configure the AWS SDN Connector.
- Enable UMS integration.
- Configure the FortiFlex connector.
- Deploy FortiGate-VM using Terraform.
- Validate FortiManager UMS auto scaling behavior.

---

## Lab Sections

### 1. Introduction

Review the lab topology, objectives, and prerequisites.

[Go to Introduction](/introduction.html)

---

### 2. Deploy FortiManager in AWS

Deploy FortiManager-VM in AWS using the Fortinet AWS CloudFormation template.

[Go to Section 2](/section2.html)

---

### 3. Configure FortiManager

Access the FortiManager GUI and complete the initial configuration.

[Go to Section 3](/section3.html)

---

### 4. Configure AWS SDN Connector

Configure the AWS SDN Connector so FortiManager can discover AWS resources.

[Go to Section 4](/section4.html)

---

### 5. Configure UMS

Enable and configure FortiManager UMS integration.

[Go to Section 5](/section5.html)

---

### 6. Configure FortiFlex

Configure FortiFlex licensing integration for FortiGate-VM instances.

[Go to Section 6](/section6.html)

---

### 7. Deploy FortiGate-VM with Terraform

Use Terraform to deploy FortiGate-VM instances in AWS.

[Go to Section 7](/section7.html)

---

### 8. Validate UMS Auto Scaling

Validate FortiManager UMS auto scaling and license assignment behavior.

[Go to Section 8](/section8.html)

---

## Notes

- Follow each section in order.
- Use the AWS region and credentials provided by your instructor.
- Do not skip prerequisite steps.
- If a deployment fails, review the previous section before continuing.
```
