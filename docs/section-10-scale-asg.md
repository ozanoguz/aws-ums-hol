# 📈 Section 10: Scaling the FortiGate Auto Scaling Group from FortiManager

In this section, you will scale the FortiGate Auto Scaling Group by using FortiManager.

You will perform two operations:

1. **Scale out** the Auto Scaling Group to increase the number of FortiGate-VM instances.
2. **Scale in** the Auto Scaling Group to reduce the number of FortiGate-VM instances.

---

## 🎯 Objectives

By the end of this section, you will be able to:

- Locate the FortiGate Auto Scaling device group in FortiManager.
- Use **Auto-Scale Instance Count** from FortiManager.
- Scale out the Auto Scaling Group by increasing the instance count.
- Scale in the Auto Scaling Group by decreasing the instance count.
- Verify that FortiGate-VM instances are added or removed.
- Understand that scaled-in FortiGate-VM entries may require manual cleanup in FortiManager.

---

## Part 1: Scale Out the Auto Scaling Group

Scaling out increases the number of FortiGate-VM instances in the Auto Scaling Group.

Follow the steps in the official Fortinet documentation below:

[Scale Out the Auto Scaling Group](https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/767426/scaling-out-the-auto-scaling-group)

---

## Part 2: Scale In the Auto Scaling Group

Scaling in reduces the number of FortiGate-VM instances in the Auto Scaling Group.

In this example, the Auto Scaling Group will be scaled in from **2 FortiGate-VM instances** to **1 FortiGate-VM instance**.

Follow the steps in the official Fortinet documentation below:

[Scale In the Auto Scaling Group](https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/389472/scaling-in-the-auto-scaling-group)
