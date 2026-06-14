# 🤖 Section 6: Create an Auto Onboarding Rule

Auto onboarding allows FortiManager to automatically onboard FortiGate instances discovered through the AWS connector.

Follow the steps in the official Fortinet documentation below:

```text
https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/670005
```

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
