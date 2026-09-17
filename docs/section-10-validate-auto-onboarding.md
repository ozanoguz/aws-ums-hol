# Section 11: Validate Auto Onboarding

Complete Section 10, Step 7 (Stage 2 activation) first. Stage 1 deliberately has no FortiGates, so registration, licensing and inspection cannot be validated until activation. For an existing deployment, complete the manual installation in Section 10, Step 8 when needed.

1. In FortiManager, go to:

   ```text
   Device Manager > Device & Groups
   ```

2. Confirm the lab ASG and both initial FortiGate instances are visible.

3. Confirm that newly discovered FortiGate devices appear in the correct device group.

4. Confirm license status.

5. Confirm device communication.

## Checkpoint

Confirm the following:

- FortiGate devices are visible in FortiManager.
- Devices are placed into the expected ADOM and device group.
- Licensing is assigned successfully.
- FortiManager communication with FortiGate is working.
- The device has the `GWLB-Web-Provisioning` template and `GWLB-Web-Demo` package from [Section 10](./section-10-fortimanager-configuration.md).
- Configuration installation succeeded, including the four demo policies.
- Both initial nodes are healthy GWLB targets. Open the demo URL and select **Start traffic** to observe inspection; flow distribution may be uneven.
- Continue to [Section 12](./section-11-scale-asg.md) to add and validate the third member.
