# Section 1: Log in to AWS

## 1.0 Retrieve Lab Credentials

Before logging in to AWS, retrieve your assigned lab credentials from the credential portal.

::: tip Credential Portal
[Open the credential portal](https://72vuxjh2olzend7kyyfomnyl540srjxk.lambda-url.eu-central-1.on.aws/)
:::

Your instructor will provide:

| Item | Value |
|---|---|
| Credential portal URL | Provided by instructor |
| Lab access key | Provided by instructor |
| Student ID | Your assigned ID, for example `student01` |

Open the credential portal URL in your browser.

On the login page, enter:

| Portal field | What to enter |
|---|---|
| Lab access key | The shared lab access key from your instructor |
| Student ID | Your assigned Student ID, for example `student01` |

Choose **Show my credentials**.

After successful login, the portal displays your assigned credentials.

You will use these portal fields during the lab:

| Portal field | Used for |
|---|---|
| Student ID | Naming convention throughout the lab |
| Account ID | AWS console account ID |
| IAM Username | AWS console username |
| Console password | AWS console password |
| FortiFlexTokenID | FortiManager deployment license token |
| Access Key ID | AWS SDN connector and Terraform |
| Secret | AWS SDN connector and Terraform |
| FortiCloud API User | FortiFlex connector |
| FortiCloud API Password | FortiFlex connector |
| Program SN | FortiFlex connector |

After logging in to the portal, keep the credential page available for the rest of the lab. You will use the AWS account, IAM user, console password, access key, secret key, FortiCloud API, and FortiFlex values in later sections.

::: warning Important
Only use the credential row assigned to your Student ID. Do not share, photograph, or reuse the credential page outside this lab.
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
