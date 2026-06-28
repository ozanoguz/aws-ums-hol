# Section 1: Log in to AWS

## 1.0 Retrieve Lab Credentials

If your instructor provides a credential portal URL, open it before logging in to AWS.

Enter:

| Field | Value |
|---|---|
| Lab access key | Provided by instructor |
| Student ID | Your assigned ID, for example `student01` |

After logging in to the portal, keep the credential page available for the rest of the lab. You will use the AWS account, IAM user, console password, access key, secret key, FortiCloud API, and FortiFlex values in later sections.

::: warning Important
Only use the credential row assigned to your Student ID. Do not share or photograph the credential page.
:::

## 1.1 Open the AWS Console

Open the AWS Console:

```text
https://console.aws.amazon.com/
```

## 1.2 Log in to AWS

Log in using the AWS account information provided by your instructor.

## 1.3 Confirm AWS Region

Confirm that you are in the correct AWS region.

AWS region will be used:

```text
eu-central-1
```

## 1.4 Create a Key Pair

This key pair will be used later throughout the lab.

### 1.4.1 Open EC2

In the AWS Console search bar, search for and open **EC2**.

### 1.4.2 Open Key Pairs

In the left navigation menu, under **Network & Security**, select **Key Pairs**.

### 1.4.3 Create Key Pair

Choose **Create key pair**.

### 1.4.4 Configure the Key Pair

Configure the key pair using the following values:

Example:

```text
Name: student01-key
Key pair type: RSA
Private key file format: .pem
```

### 1.4.5 Create the Key Pair

Choose **Create key pair**.

### 1.4.6 Save the Private Key

Save the downloaded `.pem` file in a secure location.

You will need this file later in the lab.

::: warning Important
Do not lose the private key file. You cannot download it again after creation.
:::
