# Section 6: Creating a FortiFlex Connector

Complete the FortiFlex connector configuration as provided by your instructor.

---

## Create a FortiFlex Connector

Complete this option using the provided FortiFlex API credentials.

Follow the steps in the official Fortinet documentation below:

[Create a FortiFlex Connector](https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/729208)

::: warning Important
The instructor has already supplied the FortiCloud API credentials; skip creating a new FortiCloud API user. Complete the FortiFlex connector authentication and configuration-ID selection steps.
:::

Configure the connector using the official Fortinet documentation below:

[Configuring FortiFlex Connector](https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/379795/fortiflex-connector-with-a-specific-configuration-id)

## Suggested Values

| Field | Value |
|---|---|
| Name | `student<number>-Fortiflex-Connector` |
| API User | Provided by instructor |
| API Password | Provided by instructor |
| Program SN | Provided by instructor |
| Default Config | FGT-UMS-VM04 |

Save the connector.

## Checkpoint

Confirm the following:

- FortiFlex connector exists.
- Connector test succeeds.
- The selected configuration supports the FortiGate VM size used in this lab and the later three-node exercise.
- The connector is ready to be selected in the onboarding rule in Section 7.
