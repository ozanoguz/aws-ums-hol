# AWS UMS HOL Credential Portal

This folder contains the instructor credential portal for the AWS UMS hands-on lab. It uses the same pattern as the OCI HOL portal: students enter the shared lab access key and their assigned Student ID, then the Lambda function reads a CSV object from S3 and returns only the matching row.

## CSV Format

Store the credential file in S3 as `ums_credentials.csv` unless you override `CSV_OBJECT_KEY`.

Required lookup column:

```text
Student ID
```

Recommended full header:

```text
Student ID,Account ID,IAM Username,Console password,FortiFlexTokenID,Access Key ID,Secret,FortiCloud API User,FortiCloud API Password,Program SN,FortiFlex Refresh Token
```

Use [ums_credentials.csv](./ums_credentials.csv) as the template.

## Lambda Function

Function name:

```text
aws-ums-hol-credential-portal
```

Runtime:

```text
Node.js 20.x or later
```

Handler:

```text
index.handler
```

Environment variables:

| Name | Required | Example | Notes |
|---|---:|---|---|
| `BUCKET_NAME` | Yes | `fortinetlabsbucket` | S3 bucket containing the CSV file |
| `CSV_OBJECT_KEY` | No | `ums_credentials.csv` | Defaults to `ums_credentials.csv` |
| `LAB_ACCESS_KEY` | Yes | `change-me-before-lab` | Shared key given to students |
| `ACCESS_ENABLED` | Yes | `true` | Set to `false` to close the portal |
| `ACCESS_EXPIRES_AT` | No | `2026-07-01T17:00:00Z` | ISO-8601 expiration time |

## Step-by-Step Lambda Setup

These steps assume the Lambda function already exists with this name:

```text
aws-ums-hol-credential-portal
```

### 1. Upload the CSV to S3

1. Open the S3 bucket:

   ```text
   fortinetlabsbucket
   ```

2. Upload the CSV file with this exact object name:

   ```text
   ums_credentials.csv
   ```

3. Keep the bucket private. Do not enable public access for the CSV.

4. Confirm the CSV header is:

   ```text
   Student ID,Account ID,IAM Username,Console password,FortiFlexTokenID,Access Key ID,Secret,FortiCloud API User,FortiCloud API Password,Program SN,FortiFlex Refresh Token
   ```

### 2. Package the Lambda Code

Run these commands from the repository root:

```bash
cd credential-portal/lambda
npm install --omit=dev
zip -r ../aws-ums-credential-portal.zip .
```

The package will be created here:

```text
credential-portal/aws-ums-credential-portal.zip
```

### 3. Upload the Package to Lambda

1. Open AWS Lambda.
2. Open the function:

   ```text
   aws-ums-hol-credential-portal
   ```

3. Go to **Code**.
4. Choose **Upload from**.
5. Choose **.zip file**.
6. Upload:

   ```text
   credential-portal/aws-ums-credential-portal.zip
   ```

7. Choose **Save**.

### 4. Confirm Runtime Settings

In **Runtime settings**, confirm:

| Setting | Value |
|---|---|
| Runtime | `Node.js 20.x` or later |
| Handler | `index.handler` |
| Architecture | `x86_64` or `arm64` |

Either architecture is fine for this function.

### 5. Configure Environment Variables

Open **Configuration > Environment variables** and add:

| Name | Value |
|---|---|
| `BUCKET_NAME` | `fortinetlabsbucket` |
| `CSV_OBJECT_KEY` | `ums_credentials.csv` |
| `LAB_ACCESS_KEY` | Shared instructor key for the lab |
| `ACCESS_ENABLED` | `true` |
| `ACCESS_EXPIRES_AT` | Optional expiration, for example `2026-07-01T17:00:00Z` |

Set `ACCESS_ENABLED=false` when the lab is finished.

### 6. Add S3 Permission to the Lambda Role

Attach a least-privilege policy to the Lambda execution role. Replace the bucket and object name with your values.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fortinetlabsbucket/ums_credentials.csv"
    }
  ]
}
```

Console path:

1. Open the Lambda function.
2. Go to **Configuration > Permissions**.
3. Open the execution role link.
4. In IAM, add an inline policy.
5. Use the JSON policy above.
6. Save the policy.

### 7. Create a Function URL

For a simple lab portal, Lambda Function URL is enough.

1. Open the Lambda function.
2. Go to **Configuration > Function URL**.
3. Choose **Create function URL**.
4. Set **Auth type** to:

   ```text
   NONE
   ```

5. Leave CORS disabled unless you embed this portal in another site.
6. Choose **Save**.
7. Copy the generated Function URL.

The portal has its own shared lab access key check. The Function URL still exposes the login page publicly, so only use it during the lab window and disable access afterward.

### 8. Test the Portal

Open the Function URL in a browser.

Expected behavior:

| Test | Expected result |
|---|---|
| Open URL with `GET /` | Login page appears |
| Submit wrong access key | Generic login error |
| Submit wrong Student ID | Generic login error |
| Submit valid access key and `student01` | Credential row for `student01` appears |
| Set `ACCESS_ENABLED=false` | Portal returns access closed |

Use a Student ID that exists in `ums_credentials.csv`.

### 9. Share With Students

Give each student:

| Item | Example |
|---|---|
| Credential portal URL | Lambda Function URL |
| Lab access key | Value of `LAB_ACCESS_KEY` |
| Student ID | `student01` |

Students retrieve the AWS, FortiCloud, and FortiFlex values from the portal.

### 10. Close the Portal After the Lab

At the end of the lab, do at least one of the following:

1. Set `ACCESS_ENABLED=false`.
2. Delete or disable the Function URL.
3. Remove the Lambda permission that allows public Function URL invocation.
4. Remove or rotate the CSV object.

## Optional AWS CLI Commands

Package from the repository root:

```bash
cd credential-portal/lambda
npm install --omit=dev
zip -r ../aws-ums-credential-portal.zip .
```

Update the existing Lambda function:

```bash
aws lambda update-function-code \
  --function-name aws-ums-hol-credential-portal \
  --zip-file fileb://credential-portal/aws-ums-credential-portal.zip
```

Set environment variables:

```bash
aws lambda update-function-configuration \
  --function-name aws-ums-hol-credential-portal \
  --environment "Variables={BUCKET_NAME=fortinetlabsbucket,CSV_OBJECT_KEY=ums_credentials.csv,LAB_ACCESS_KEY=change-me-before-lab,ACCESS_ENABLED=true}"
```

The portal intentionally sets no-store cache headers, prevents framing, uses a constant-time comparison for the shared access key, delays failed login attempts, and only accepts Student IDs in the `student01` format.
