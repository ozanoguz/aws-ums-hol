# Section 12: Scaling the FortiGate Auto Scaling Group from FortiManager

In this section, you will scale the FortiGate Auto Scaling Group by using FortiManager.

You will perform two operations:

1. **Scale out** the Auto Scaling Group to increase the number of FortiGate-VM instances.
2. **Scale in** the Auto Scaling Group to reduce the number of FortiGate-VM instances.

---

## Objectives

By the end of this section, you will be able to:

- Locate the FortiGate Auto Scaling device group in FortiManager.
- Use **Auto-Scale Instance Count** from FortiManager.
- Scale out the Auto Scaling Group by increasing the instance count.
- Scale in the Auto Scaling Group by decreasing the instance count.
- Verify that FortiGate-VM instances are added or removed.
- Understand that scaled-in FortiGate-VM entries may require manual cleanup in FortiManager.

---

## Part 1: Scale Out the Auto Scaling Group

Start with **2** healthy FortiGates. In FortiManager, use **Auto-Scale Instance Count** to increase the desired count to **3**. The Terraform ASG maximum from Section 9 must be at least 3, and the FortiFlex configuration must have capacity to license the third device.

Before scaling, confirm the onboarding rule already assigns the `GWLB-Web-Templates` group and populated `GWLB-Web-Demo` package. After scaling:

1. Wait for the new instance to register and receive a license.
2. Confirm provisioning and policy-package installation succeed on the new device.
3. Wait for its GWLB target health to become healthy.
4. Open the existing web-demo URL and select **Start traffic**. A third card appears automatically; it flashes after matched traffic reaches that device. Healthy status alone does not produce a flash. GWLB hashing and AZ eligibility can make traffic uneven.

Use FortiManager for this exercise. Avoid reapplying an old Terraform plan with desired capacity 2 during scale-out; Terraform can reconcile capacity back to its configured value.

Follow the steps in the official Fortinet documentation below:

[Scale Out the Auto Scaling Group](https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/767426/scaling-out-the-auto-scaling-group)

---

## Part 2: Scale In the Auto Scaling Group

Scaling in reduces the number of FortiGate-VM instances in the Auto Scaling Group.

In this example, the Auto Scaling Group will be scaled in from **3 FortiGate-VM instances** back to the **2-instance baseline**.

Follow the steps in the official Fortinet documentation below:

[Scale In the Auto Scaling Group](https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/389472/scaling-in-the-auto-scaling-group)


Wait for scale-in to finish, then confirm the remaining two targets are healthy and the demo remains reachable. The removed member disappears on the next successful inventory refresh. Review any stale FortiManager entries before manual cleanup; do not remove a device that is still active.
