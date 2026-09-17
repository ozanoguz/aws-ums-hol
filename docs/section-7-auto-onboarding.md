# Section 7: Create an Auto Onboarding Rule

FortiGates initiate automatic registration using the FortiManager API key supplied by Terraform. The onboarding rule selects licensing and configuration actions; the AWS SDN connector associates authorized devices with their ASG.

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
| Device Group | Optional; leave unassigned unless your instructor has created a custom device group |
| Install License | Flex VM |
| Install Configuration | Manual Configuration |
| Policy Package | `default` as a temporary placeholder; replace with `GWLB-Web-Demo` before activation in Section 10 |
| Maximum Device Number | 4 |


Select the FortiFlex connector/configuration prepared in Section 6. Keep the same API administrator selected here as the API key used later in `fmg_integration.ums.api_key`.

At this stage, no FortiGates are expected in a new lab. Section 9 creates infrastructure with ASG capacity held at zero. [Section 10](./section-10-fortimanager-configuration.md) creates the provisioning template and populated policy package, updates this rule, and only then activates the ASG. Do not launch FortiGates while this rule still selects the placeholder package.

**Checkpoint:** the rule is saved with the correct API administrator and FortiFlex connector. Device registration and licensing are checked after Section 10 activation. For an existing deployment, updating the rule alone does not install configuration; follow Section 10, Step 8.
