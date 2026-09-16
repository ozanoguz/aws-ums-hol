# Section 7: Create an Auto Onboarding Rule

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
| Policy Package | `default` temporarily for initial onboarding; replaced with `GWLB-Web-Demo` in Section 10 |
| Maximum Device Number | 4 |


Select the FortiFlex connector/configuration prepared in Section 6. Keep the same API administrator selected here as the API key used later in `fmg_integration.ums.api_key`.

At this stage, GENEVE tunnels and demo policies have not been created. Initial registration/licensing is expected, but web inspection is not ready yet. After Terraform deployment, [Section 10](./section-10-fortimanager-configuration.md) creates the provisioning template and populated policy package, updates this existing rule, and explicitly installs them on the already registered devices. Do not assume an empty/default package provides the demo policies.
