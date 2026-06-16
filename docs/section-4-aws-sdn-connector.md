# Section 4: Create the AWS Cloud SDN Connector

The AWS Cloud SDN connector allows FortiManager to discover AWS resources including Auto Scaling Groups, VPCs, EC2 instances, and other AWS resources.

Follow the steps in the official Fortinet documentation below:

[Creating AWS SDN Connector](https://docs.fortinet.com/document/fortimanager/7.6.5/administration-guide/390041/creating-aws-fabric-connectors)

## Suggested Values

| Field | Value |
|---|---|
| Name | `student<number>-AWS-SDN-Connector` |
| Cloud Provider | AWS |
| Authentication Type | Access Key |
| Access Key ID | Provided by instructor (Column F)|
| Secret Access Key | Provided by instructor (Column G) |
| Region | `eu-central-1` |

## Save and Test the Connector

1. Save the connector.

2. Test the connector.

3. Right-click and choose:

```text
View Connector Objects
```

::: tip Checkpoint
Confirm that FortiManager can discover AWS objects through the connector.
:::
