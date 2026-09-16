# Instructor scoring service

A single dashboard for student deployments, using Python 3.10+ with no additional packages or AWS credentials. Student endpoints already supply AWS inventory and correlated FortiGate syslog. No student guide changes are needed.

## Run

From `scoring_service`:

```bash
cp students.example.json students.json
```

Replace example IPs with each student's Terraform `web_demo.url`. IDs must be unique. Account IDs are optional display labels, not AWS credentials. Restart after editing this Git-ignored configuration file.

```bash
python3 server.py
```

Open **http://127.0.0.1:8090**. Ctrl+C stops it. Optional flags: `--port 8091`, `--interval 10`, `--config /path/to/students.json`. The instructor service binds to localhost and has no login system. For a remote host, use SSH forwarding (`ssh -L 8090:127.0.0.1:8090 user@host`).

## Measurements

Each round checks `/healthz`, sends three fresh `/probe` requests, then reads `/api/state`. Up to 16 student checks run concurrently, with three-second request timeouts, no redirects and a 1 MiB response limit. Default round interval: five seconds. Large or slow cohorts can take longer; results older than 30 seconds are stale.

- **Web reachable:** health endpoint returned `ok`.
- **2 healthy:** at least two current ASG members are `InService` and GWLB `healthy`, with fresh discovery.
- **3 healthy:** the same with three members, showing scale-out progress.
- **3 inspected:** three currently healthy members handled instructor probes confirmed by the student's correlation service in the last 120 seconds.
- **Flashing square:** a new match for an instructor-issued probe. Inventory alone or another user's probes never trigger a flash.

First-achieved milestone times persist only during this instructor-service session. Current counts decrease after scale-in or failure. Old inventory remains visible as stale; replacement instances cannot inherit another instance's inspection evidence. Restart clears history.

Keep the instructor and student server clocks synchronized; responses with a timestamp more than 30 seconds from the instructor clock are stale.

Student HTTP/80 must be reachable from the instructor host. No public syslog port is needed. GWLB hashing is uneven; target AZ eligibility and cross-zone settings affect which nodes receive probes. A third healthy node and a third observed inspecting are separate milestones. Correlation may appear on a later poll. Heavy student probe traffic can evict instructor IDs from the student's bounded recent-probe list; missing evidence is never treated as a pass.

This service measures observable behavior, not whether a student used the FortiManager UI to scale out. It trusts the configured student's telemetry and cannot authenticate an account label. Register student URLs explicitly; AWS account enumeration and a numeric grading rubric are not assumed.

## Test

```bash
python3 -m unittest discover -s tests -v
```

## Automatic discovery from student00

Use this mode on an EC2 instance in student00 with an instance profile allowed to assume the existing cross-account role. The list of student account IDs is supplied explicitly; `organizations:ListAccounts` is not needed. Merely being in the same Organization does not grant role access. The student role must trust the **instance role** actually running this process, not just an instructor's interactive login role.

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp accounts.example.json accounts.json
```

Edit `accounts.json`: keep `role_name` as `UMSScoringReadOnly` after running the setup below, keep region `eu-central-1`, and enter the student account IDs and display names. student00 is included as the instructor demonstration account. Optional top-level `external_id` is supported if required by the role trust policy. Do not put AWS keys in this file.

```bash
.venv/bin/python server.py --aws-config accounts.json
```

The standard AWS credential chain supplies student00's credentials (EC2 instance profile in deployment, or `AWS_PROFILE` for local testing). The service calls STS AssumeRole and `ec2:DescribeAddresses` in each listed account every 60 seconds, matching EIPs tagged `Name = *gwlb-demo-web`. Only associated EIPs are eligible. HTTP checks continue every polling round once a URL is known. Temporary STS credentials are obtained for each discovery and never saved to disk or exposed in the dashboard.

Student00 uses the scoring instance role directly for EC2 address discovery; other accounts use the read-only cross-account role. Each account appears before deployment. Missing EIPs show **Awaiting URL**, access failures show the AWS error code, and new EIPs are discovered automatically without restarting. Multiple matching EIPs are treated as ambiguous, not arbitrarily selected. In that case add `"eip_name": "<exact Name tag>"` to the account entry. When a deployment's URL changes, its current evidence and session milestones reset. Temporary discovery failures preserve history but suspend current success indications until discovery recovers. Removing/replacing URLs prevents continued polling of a known-stale EIP after a discovery result says it is gone.

### IAM requirements

Templates are in `iam/`; replace all angle-bracket values before use:

- **student00 instance role:** `student00-assume-policy.example.json`, with explicit role ARNs for the permitted student accounts.
- **Each student target role:** trust the student00 instance-role ARN as illustrated by `student-role-trust.example.json`, and allow the read permission in `student-role-read-policy.json`.
- Existing cross-account roles can be reused if they already allow these operations. These files do not modify IAM automatically. Preserve other required trust statements when updating an existing role. SCPs, permission boundaries and explicit denies still apply.

No EC2 write, FortiManager administrator, or Organizations inventory permissions are required for URL discovery. The progress evidence continues to come from the student's existing HTTP service.

### Run as a service in student00

The repository can be placed at `/opt/aws-ums-hol` on an instructor EC2 host with Python 3.10+, outbound HTTPS to AWS STS/EC2 and outbound HTTP to student EIPs. Create an unprivileged `scoring` OS user with read/execute access to this folder. Configure its instance profile as above, prepare `.venv` and `accounts.json`, and adapt `scoring-service.service.example` if your paths/user differ. Install that unit as `/etc/systemd/system/scoring-service.service`, then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now scoring-service
sudo journalctl -u scoring-service -n 50 --no-pager
```

The dashboard still binds to localhost: use SSH forwarding to open it on the instructor's browser. EC2/VPC creation and IAM changes are not performed by these files. No student-facing guides are changed.

References: [STS AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html), [EC2 DescribeAddresses](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeAddresses.html).

## One-time setup using training-admin

Your existing organization administration role is `OrganizationAccountAccessRole`. The setup script assumes that role in student00 and each listed student account. It creates separate runtime roles; it does not change the organization administration role, existing users, passwords or access keys.

Run from this folder in your training-admin environment:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python setup_iam.py
```

The default command prints the complete intended account list, trust policies and permissions locally without AWS calls. Review it, then apply using your training-admin credentials:

```bash
.venv/bin/python setup_iam.py --execute
```

If `training-admin` is also the name of a configured AWS CLI profile, use `--profile training-admin`. Do not assume an AWS account name is automatically a local profile name.

The script first creates `UMSScoringInstanceRole` and its same-named EC2 instance profile in student00 (`594379811663`), then creates `UMSScoringReadOnly` in student01–student34. It embeds the supplied 34 student accounts by default (override with `--accounts accounts.json`); the administrative role name is separately fixed to `OrganizationAccountAccessRole` in `setup_iam.py`.

The assumed admin role must permit IAM role creation/tagging, inline policy updates, trust-policy updates, instance-profile creation/tagging, profile inspection and role attachment (`iam:PassRole` included). The original training-admin caller needs STS AssumeRole access to all 35 accounts. SCPs and permission boundaries still apply.

Re-running updates only dedicated resources tagged `ManagedBy=UMSScoringSetup`. Existing untagged roles/profiles with the same names cause an error rather than being overwritten. Partial failures are reported per student and return a nonzero exit code; rerun after resolving them. Additional manually attached policies on these roles are not removed by this script; keep them dedicated to this purpose.

After success, attach **UMSScoringInstanceRole** as the IAM instance profile of the scoring EC2 instance in student00. The instance must separately have any permissions needed for your chosen management method (for example SSM); the scorer role itself only grants cross-account discovery. Allow time for IAM propagation. Then start:

```bash
.venv/bin/python server.py --aws-config accounts.json
```

No student web URLs need to be entered manually. IAM setup does not provision or modify EC2 hosts, and no setup has been executed merely by adding these files.

### Run the setup as one file in training-admin CloudShell

`setup_iam.py` is standalone: it does not import `aws_discovery.py`, `common.py`, or `config.py`, and does not need `accounts.json` unless `--accounts` is supplied. Copy or upload this one file to the CloudShell opened from your training-admin AWS Console session. You can rename it `ums_iam.py`.

```bash
aws sts get-caller-identity
python3 ums_iam.py
python3 ums_iam.py --execute
```

Verify the identity is your intended training-admin session before applying. Do not pass `--profile training-admin` in CloudShell unless you explicitly configured that profile; the console session supplies credentials. Boto3 is needed only for `--execute` (install with `python3 -m pip install --user boto3` if missing). The preview makes no AWS calls and prints the exact targets and policies.

## Compact control room and student selection

The control room displays one row per student ID with FortiGate squares. Use the **Student accounts** dropdown to select any combination of students; **All** and **None** provide shortcuts. Selection is saved in this browser. Filtering changes the display only; the service continues polling every configured account.

Blue squares are healthy FortiGates, green squares have recent matched probe evidence, and a flash marks a newly matched instructor probe. Gray indicates unavailable/stale data; an outlined square is a placeholder awaiting discovery. The third square fills when the third FortiGate is discovered. Detailed metrics remain available on each student's own page.

## Install as an automatic Linux EC2 service (recommended)

Run this on the **student00 EC2 host**, not CloudShell. Copy the updated `scoring_service` folder, including `accounts.json`, to that host. Attach its existing `UMSScoringInstanceRole` instance profile. The host needs Python 3.10+, `venv`/pip, systemd, and outbound access to package repositories, AWS APIs and the student EIPs. On Ubuntu install `python3-venv` if it is missing. The service uses the instance profile, not your shell's AWS credentials.

From the copied folder:

```bash
sudo bash install_service.sh
```

This copies the application to `/opt/ums-scoring`, installs Python dependencies, creates an unprivileged `scoring` user, installs **ums-scoring.service**, starts it now and enables it at boot. Both URL discovery/polling and the web server run in that service. It restarts after process failures. Rerun the installer with the updated source folder to deploy updates; the previous installed account configuration is backed up as `accounts.json.previous`.

By default it listens on localhost port 8090; keep using SSH forwarding. To access the dashboard directly through your EC2 address instead:

```bash
sudo bash install_service.sh --listen-host 0.0.0.0 --port 8090
```

Permit inbound TCP 8090 from the instructor's network in the EC2 security group, then open `http://<SCORING_EC2_PUBLIC_IP>:8090`. This dashboard has no login; keep that ingress instructor-only. The installer does not change AWS security groups. An existing manual Python process on the same port must be stopped first. The previously documented `scoring-service.service` is disabled when its configuration matches the old scoring application.

```bash
sudo systemctl status ums-scoring --no-pager
sudo systemctl is-enabled ums-scoring
sudo journalctl -u ums-scoring -n 100 --no-pager
sudo systemctl restart ums-scoring
```

To update the account list after installation, edit `/opt/ums-scoring/accounts.json` and restart the service. To change binding/port, edit `/etc/default/ums-scoring` and restart. The EC2 public IPv4 address can change after stop/start unless you associate an Elastic IP; that does not affect automatic service startup.

The old `.service.example` is retained for manual installations. Use the installer above for new installations rather than enabling both units. Service installation does not create EC2 resources or modify student IAM roles.

Additional frontend check: `node tests/test_dashboard.cjs` (Node is needed for development testing only).


## Classroom grid and student00 demonstration

The control room now uses a compact five-column grid on desktop displays. All 35 accounts fit in a typical 1280×720 or 1920×1080 browser viewport at normal zoom. Narrow/mobile windows wrap into fewer columns and may still scroll. Use browser full-screen mode for projection. The account dropdown still supports a saved subset; click **All** after upgrading if student00 is hidden by an older saved selection.

student00 is included and its tile is highlighted. Deploy the same student demo stack there to provide its own FortiGate/web-service demonstration; adding the account does not create that demo. Its demo EIP is discovered from the same `*gwlb-demo-web` Name tag, not from the scoring EC2 EIP.

Upgrade steps:

1. In training-admin CloudShell, run the updated standalone `ums_iam.py` preview, then `python3 ums_iam.py --execute`. This adds `ec2:DescribeAddresses` to the existing student00 scoring instance role and retains cross-account access. No extra read-only role in student00 is required.
2. Copy the updated scoring folder, including the 35-account `accounts.json`, to the scoring EC2 host and rerun the installer with the same listen-host/port options as before.
3. Reload the page and choose **All**. Student00 remains awaiting URL until its demo EIP is deployed; IAM changes may take time to propagate.


### Expanded classroom cards

Cards now include web reachability, current healthy/verified counts, a short deployment phase and three progress segments (2 healthy, 3 healthy, 3 inspecting). Layout adapts to viewport size and selection count: smaller groups receive larger cards; all-account views use compact cards. On dense screens the phase text is omitted while counts and progress remain. The selected accounts and evidence-based flashing behavior are unchanged. No IAM update is needed for this visual update; deploy the updated files and restart via the installer using your existing bind/port options.


### FortiManager deployment indicator

Each account card includes a steady (non-blinking) FortiManager label. The AWS check runs with URL discovery every 60 seconds, even when no demo EIP exists. Running instances show **FMG deployed**; stopped/pending instances show their EC2 state. No matching non-terminated instances yields **FMG not found**. Permission/discovery failures show **FMG unknown**, and old results become **FMG stale** after 120 seconds. This is EC2 deployment evidence, not an HTTPS, licensing, configuration or FGFM test.

Identification uses the EC2 **Name** tag: case-insensitive `FortiManager` anywhere in the name, or `FMG` as a word separated by spaces/hyphens/underscores. For custom names, set `"fmg_name": "student01-manager"` (case-sensitive wildcard matching supported) on that account in `accounts.json`; alternatively set `"fmg_instance_id": "i-..."` for an exact instance. Inspect these settings if a known deployment shows not found. Terminated and shutting-down instances are excluded. The region remains eu-central-1.

Before installing this update, run the updated standalone `ums_iam.py --execute` in training-admin CloudShell (preview without `--execute`). It adds **ec2:DescribeInstances** to the dedicated student read roles and student00 scoring instance role. Then install the service update on the scoring EC2 host using your existing binding options. Keep any per-account selector overrides when replacing `accounts.json`. No student-facing guide or student deployment changes are needed.
