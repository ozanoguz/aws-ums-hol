# Section 10: Configure FortiManager Templates and the Policy Package

After the Terraform deployment in [Section 9](./section-9-terraform-asg.md), configure FortiManager to provision the GWLB inspection path and the web demo. Create these configurations once, install them on the existing FortiGates, and assign them to the existing auto-onboarding rule for future ASG members.

## Objectives

- Create a CLI provisioning template for GENEVE tunnels, routing and private syslog.
- Create a template group containing the provisioning template.
- Create an empty dedicated policy package.
- Create and run a CLI script to populate the package with address objects, interface mappings and firewall rules.
- Update the existing UMS onboarding rule without changing its FortiFlex licensing configuration.
- Install the configuration on already registered devices and test the web demo.

## Step 1: Collect Your Deployment Values

Use the same ADOM as the existing onboarding rule, normally `root`. This section assumes the lab's two-arm FortiGates with a root VDOM, `port1` for GWLB traffic and `port2` for management. It uses a dedicated policy package with policy-based NGFW and central NAT disabled.

From the Terraform example directory, run:

```bash
terraform output -json web_demo
```

Record `url` and `collector_private_ip`. A `null` output means the demo was disabled in your local variables. Restore the supplied `web_demo` configuration and apply it from the same Terraform workspace before continuing. The HTTP server uses `10.50.0.10` and the private collector uses `10.50.0.11` when `web_demo.vpc_cidr` is `10.50.0.0/16`.

Find the GWLB node addresses in the AWS Console:

1. Under **EC2 → Load Balancers**, select this lab's **Gateway Load Balancer** and note its VPC, Availability Zones, subnets and ARN suffix (`gwy/name/id`).
2. Under **EC2 → Network Interfaces**, filter by that VPC. Locate the load balancer interfaces whose descriptions identify the same GWLB, usually `ELB gwy/name/id`.
3. Match each interface's subnet/AZ to `availability_zones[0]` (AZ1) and `availability_zones[1]` (AZ2) in Terraform, and record its primary private IPv4 address. Use the GWLB node interfaces, not the FortiGate interfaces or GWLB endpoint interfaces.

| Script value | Replace with |
|---|---|
| `<GWLB_NODE_AZ1_PRIVATE_IP>` | Your GWLB node's private IP in AZ1 |
| `<GWLB_NODE_AZ2_PRIVATE_IP>` | Your GWLB node's private IP in AZ2 |
| `10.50.0.10` | Keep for the default demo VPC; otherwise use the HTTP server's actual primary private IP |
| `10.50.0.11` | Keep for the default demo VPC; otherwise use `collector_private_ip` from Terraform |

::: warning Replace values before running
The angle-bracket values below are placeholders, not FortiManager variables. Replace every occurrence before saving the scripts. HTTP/80 is public (`0.0.0.0/0`) so browsers and the instructor monitoring service can reach each student deployment. The policy uses source `all`; no client-IP substitution is needed. Syslog remains private.
:::

## Step 2: Create the GENEVE, Routes and Syslog CLI Template

1. Go to **Device Manager → Provisioning Templates → CLI**.
2. Select **Create New → CLI Template**, not **Pre-Run CLI Template**.
3. Name it `GWLB-Web-Provisioning`, select **CLI Script**, and set **Position → Pre-VDOM Copy**. This applies the tunnel configuration before the policy package during installation.
4. Paste the script below after replacing your deployment values, then save.

Reserve static route IDs `101`, `102`, `111`, `112`, `190`, policy route IDs `101`, `102`, and `syslogd2` for this lab. Reconcile existing entries at these IDs instead of overwriting unrelated configurations. If a prior lab template configures these same tunnels or routes, update/replace its assignment so only one template owns them.

The template relies on the bootstrap configuration: `port1` uses DHCP with distance 6; `port2` has a DHCP management default route with distance 5 and priority lower than 100. Preserve that management route and the existing FortiManager registration/UMS settings.

```text
config system geneve
    edit "geneve-az1"
        set interface "port1"
        set type ppp
        set remote-ip <GWLB_NODE_AZ1_PRIVATE_IP>
    next
    edit "geneve-az2"
        set interface "port1"
        set type ppp
        set remote-ip <GWLB_NODE_AZ2_PRIVATE_IP>
    next
end

config router static
    edit 101
        set dst <GWLB_NODE_AZ1_PRIVATE_IP> 255.255.255.255
        set device "port1"
        set dynamic-gateway enable
    next
    edit 102
        set dst <GWLB_NODE_AZ2_PRIVATE_IP> 255.255.255.255
        set device "port1"
        set dynamic-gateway enable
    next
    edit 111
        set dst 0.0.0.0 0.0.0.0
        set distance 5
        set priority 100
        set device "geneve-az1"
    next
    edit 112
        set dst 0.0.0.0 0.0.0.0
        set distance 5
        set priority 100
        set device "geneve-az2"
    next
    edit 190
        set dst 10.50.0.11 255.255.255.255
        set device "port2"
        set dynamic-gateway enable
    next
end

config router policy
    edit 101
        set input-device "geneve-az1"
        set src "0.0.0.0/0.0.0.0"
        set dst "0.0.0.0/0.0.0.0"
        set output-device "geneve-az1"
    next
    edit 102
        set input-device "geneve-az2"
        set src "0.0.0.0/0.0.0.0"
        set dst "0.0.0.0/0.0.0.0"
        set output-device "geneve-az2"
    next
end

config log syslogd2 setting
    set status enable
    set server "10.50.0.11"
    set mode udp
    set port 5514
    set format default
    set interface-select-method specify
    set interface "port2"
end

config log syslogd2 filter
    set severity information
    set forward-traffic enable
end
```

The collector route intentionally uses `10.50.0.11/32`, not the HTTP server's `10.50.0.10`. The demo Terraform module provides the private VPC peering route and collector security group. Management-side security groups and NACLs must also permit this UDP traffic.

**Before continuing:** confirm `GWLB-Web-Provisioning` is saved as a regular CLI template with **Pre-VDOM Copy**, and both GWLB address placeholders have been replaced.

## Step 3: Create the Template Group

1. Go to **Device Manager → Provisioning Templates**.
2. Create a **Template Group** named `GWLB-Web-Templates`.
3. Add the CLI template **GWLB-Web-Provisioning** created in Step 2.
4. Save the group.

**Before continuing:** reopen `GWLB-Web-Templates` and confirm it contains `GWLB-Web-Provisioning`. Creating the group does not install it on a FortiGate; assignment and installation follow in Steps 6 and 7.

## Step 4: Create an Empty Dedicated Policy Package

1. Stay in the same ADOM as the demo FortiGates and onboarding rule, normally `root`.
2. Go to **Policy & Objects → Policy Packages**.
3. Create a new policy package named **GWLB-Web-Demo**.
4. Save the package. Leave it empty for now; Step 5 creates its policies.

Use this dedicated package for the demo ASG. It does not reproduce unrelated policies from an existing package. If `GWLB-Web-Demo` already exists, open and inspect it before proceeding; do not delete existing policies merely to make it empty.

**Before continuing:** confirm `GWLB-Web-Demo` appears in the correct ADOM. Do not install an empty package or select it in the onboarding rule yet.

## Step 5: Create and Run the Policy-Package CLI Script

### 5.1 Create the script

1. Go to **Device Manager → Scripts**.
2. Select **Create New → Script**.
3. Set these fields:

| Field | Value |
|---|---|
| Name | `Create-Demo-Policies` |
| Type | **CLI Script** |
| Run Script on | **Policy Package or ADOM Database** |

4. Paste the following script after substituting any changed demo addresses, then save it as **Create-Demo-Policies**.

::: warning Script target matters
This is a FortiManager policy-package script, not a device provisioning template. Do not select **Device Database** or **Remote FortiGate Directly**. `config dynamic interface` belongs to the FortiManager ADOM database; a device-database execution fails with `object unrecognized` on line 1.
:::

```text
config dynamic interface
    edit "Demo-GENEVE-AZ1"
        set default-mapping enable
        set defmap-intf "geneve-az1"
    next
    edit "Demo-GENEVE-AZ2"
        set default-mapping enable
        set defmap-intf "geneve-az2"
    next
end

config firewall address
    edit "Demo-Web"
        set type ipmask
        set subnet 10.50.0.10 255.255.255.255
        set comment "Spoke web server private IP; AWS EIP translation occurs at IGW"
    next
    edit "Demo-Syslog"
        set type ipmask
        set subnet 10.50.0.11 255.255.255.255
        set comment "Private collector; FortiGate local-out UDP 5514 through port2"
    next
end

config firewall policy
    edit 1010
        set name "Demo-HTTP-AZ1"
        set status enable
        set srcintf "Demo-GENEVE-AZ1"
        set dstintf "Demo-GENEVE-AZ1"
        set srcaddr "all"
        set dstaddr "Demo-Web"
        set action accept
        set schedule "always"
        set service "HTTP"
        set nat disable
        set logtraffic all
        set logtraffic-start enable
    next
    edit 1011
        set name "Demo-Egress-AZ1"
        set status enable
        set srcintf "Demo-GENEVE-AZ1"
        set dstintf "Demo-GENEVE-AZ1"
        set srcaddr "Demo-Web"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "HTTP" "HTTPS"
        set nat disable
        set logtraffic all
        set logtraffic-start enable
    next
    edit 1020
        set name "Demo-HTTP-AZ2"
        set status enable
        set srcintf "Demo-GENEVE-AZ2"
        set dstintf "Demo-GENEVE-AZ2"
        set srcaddr "all"
        set dstaddr "Demo-Web"
        set action accept
        set schedule "always"
        set service "HTTP"
        set nat disable
        set logtraffic all
        set logtraffic-start enable
    next
    edit 1021
        set name "Demo-Egress-AZ2"
        set status enable
        set srcintf "Demo-GENEVE-AZ2"
        set dstintf "Demo-GENEVE-AZ2"
        set srcaddr "Demo-Web"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "HTTP" "HTTPS"
        set nat disable
        set logtraffic all
        set logtraffic-start enable
    next
end
```

### 5.2 Run the saved script

1. In **Device Manager → Scripts**, right-click **Create-Demo-Policies** and select **Run Script**.
2. Select **GWLB-Web-Demo** as the target policy package. The target must be the package, not a FortiGate serial number.
3. Run the script.
4. Open the execution result and confirm success. If it fails, correct the error before continuing.

**Saving is not execution.** The package remains empty until the script runs successfully.

### 5.3 Verify the populated package

Refresh **Policy & Objects → Policy Packages → GWLB-Web-Demo** and confirm all four policies exist:

| ID | Policy | Purpose |
|---|---|---|
| 1010 | Demo-HTTP-AZ1 | Any IPv4 client → web server, HTTP, AZ1 tunnel |
| 1011 | Demo-Egress-AZ1 | Web server → Internet, HTTP/HTTPS, AZ1 tunnel |
| 1020 | Demo-HTTP-AZ2 | Any IPv4 client → web server, HTTP, AZ2 tunnel |
| 1021 | Demo-Egress-AZ2 | Web server → Internet, HTTP/HTTPS, AZ2 tunnel |

All four rules disable NAT and enable all-session and session-start logging. Default normalized-interface mappings resolve to `geneve-az1` and `geneve-az2` for future devices without per-device mapping work. Stateful replies do not need separate reverse rules. These are connectivity and logging policies; security profiles are not included.

No FortiGate VIP is required: the AWS Internet Gateway translates the web server's Elastic IP to its private IP before delivery into the VPC. The policies therefore match `Demo-Web`. Syslog is generated locally by FortiGate and needs no forward-traffic policy. `Demo-Syslog` documents the collector address; it may not be installed as an address object because no firewall rule references it.

**Before continuing:** the script task must show success and the package must contain policies `1010`, `1011`, `1020` and `1021`.

## Step 6: Update the Existing Auto-Onboarding Rule

1. Go to **Device Manager → Device & Groups → Add Device dropdown → Auto Onboarding**.
2. Edit the rule created in Section 7. Keep its matching API administrator, ADOM, device group, **Flex VM** licensing and FortiFlex connector settings.
3. Under **Install Configuration**, select **Manual Configuration**.
4. Select template group **GWLB-Web-Templates** and policy package **GWLB-Web-Demo**.
5. Save the rule.

The package must already contain the four rules before a new FortiGate onboards. A script saved under Device Manager is not automatically run to populate a package by the onboarding rule.

Future matching ASG instances receive the provisioning template and policy package through onboarding. Adding a third FortiGate does not require a third GENEVE tunnel: all FortiGates use the same deployed GWLB node addresses. Recheck the addresses if the GWLB is recreated.

**Before continuing:** reopen the onboarding rule and confirm both **GWLB-Web-Templates** and **GWLB-Web-Demo** are selected.

## Step 7: Install on the FortiGates Already Registered

::: warning Required for the FortiGates deployed in Section 9
Complete this step for **both existing FortiGates**, even if they already appear online in FortiManager. Updating the auto-onboarding rule in Step 6 does not retroactively install templates or policies. Registration alone does not mean the inspection configuration is installed.
:::

### 7.1 Check the devices and package

1. In the same ADOM used above, open **Device Manager → Device & Groups**.
2. Confirm both demo FortiGates are authorized and online. Record their serial numbers so you can select the correct installation targets.
3. Open **Policy & Objects → Policy Packages → GWLB-Web-Demo** and confirm policies **1010, 1011, 1020 and 1021** exist. If the package is empty, complete Step 5 before proceeding.

### 7.2 Assign the provisioning template group to existing devices

1. Go to **Device Manager → Provisioning Templates → Template Group**.
2. Select **GWLB-Web-Templates** and open its device/device-group assignment control.
3. Add both existing demo FortiGates and save the assignment.
4. Verify both devices appear in the group's assignments and the group contains **GWLB-Web-Provisioning** with **Pre-VDOM Copy**.

Assigning the group makes its configuration available for installation; saving the assignment alone is not proof that the FortiGates received it.

### 7.3 Set the policy-package installation targets

1. Go to **Policy & Objects → Policy Packages** and select **GWLB-Web-Demo**.
2. Open **Installation Targets** and edit the targets.
3. Add both existing demo FortiGates with their **root** VDOM, then save.
4. Check the four policies' **Install On** settings include those targets.

The package selected in the onboarding rule applies to future matching devices. Explicitly selecting these existing targets ensures the following installation uses the demo package for them.

### 7.4 Install both the package and device settings

1. From **Policy & Objects → Policy Packages**, select **GWLB-Web-Demo**, then **Install → Install Wizard**.
2. Choose **Install Policy Package & Device Settings** so the installation includes the assigned provisioning template as well as the firewall policies.
3. Select both existing demo FortiGates/root VDOM as targets.
4. Generate and review **Install Preview** for each device. Confirm it includes the GENEVE tunnels, routes, syslog configuration and four firewall policies. The normalized interfaces must resolve to `geneve-az1` and `geneve-az2`.
5. Confirm the management route through `port2` and existing FortiManager registration/UMS settings remain correct. If expected configuration is missing from the preview, return to the assignments above before installing.
6. Install and wait for the task to finish. Check the result for **each FortiGate**; one successful device does not mean both succeeded.

The **Create-Demo-Policies** script populates the FortiManager package database. Do not run it directly on a FortiGate; this installation step delivers its policies to the devices.

### 7.5 Verify the configuration on both FortiGates

On each FortiGate in the root VDOM, run:

```text
show system geneve
show firewall policy
get router info routing-table all
show log syslogd2 setting
```

Confirm both GENEVE interfaces, the four demo policies, the GWLB routes and syslog destination `10.50.0.11:5514` are present. Check the route to your FortiManager IP resolves through `port2` and both devices remain online in FortiManager.

If a task fails, open its error details, correct the reported problem, then repeat the installation for the affected device. Do not delete/re-register the devices or redeploy Terraform just to trigger onboarding again.

**Before continuing:** both existing FortiGates must have a successful installation and the expected configuration. Then proceed to Step 8 to test traffic. Future scale-out instances use the onboarding rule from Step 6.

### Updating an Existing Restricted Deployment

Set `web_demo.allowed_client_cidrs = ["0.0.0.0/0"]` in Terraform, then review `terraform plan` and apply it. Re-run the updated policy-package script against `GWLB-Web-Demo` and install the package on existing FortiGates. Policies 1010 and 1020 now use source `all`; previously created `Demo-Clients` objects can remain unused. Keep the updated package assigned to the onboarding rule. Both the AWS security group and FortiGate policy must allow public HTTP.

## Step 8: Test the Web Page and Activity Lights

Open the `url` from `terraform output -json web_demo` using **HTTP** from an external browser or monitoring service. Click **Start traffic**. The destination is the web server's Elastic IP, not FortiManager's IP or a FortiGate management IP.

```text
Browser → web EIP / spoke IGW → GWLBE → GWLB → selected FortiGate
                                                     ↓
Web server 10.50.0.10 ← GWLBE ← GWLB ← inspected traffic

FortiGate port2 → private peering → 10.50.0.11:5514 → activity correlation
```

The web server responds to HTTP requests; FortiGates inspect them. The dashboard discovers ASG members and matches test connections to FortiGate syslog records. A new member gets a card automatically; it blinks only after receiving an eligible test flow and its log reaches the collector. GWLB flow hashing does not guarantee an even distribution, and cross-zone/AZ eligibility affects which targets receive traffic.

If outbound connectivity was unavailable before the policy installation, allow a few minutes for the web server installer: it retries every minute.

| Symptom | Check |
|---|---|
| Policy package empty | Execute `Create-Demo-Policies` against the package; saving alone is insufficient |
| `config dynamic interface` / `object unrecognized` | Change the script target from Device Database to Policy Package or ADOM Database |
| Policies in FortiManager but absent from FortiGate | Run Install Policy Package & Device Settings and inspect the task result |
| Interface mapping/install error | Check default mappings and the Pre-VDOM Copy template's tunnel creation |
| Page unreachable | Public HTTP/80 security-group rule, GWLB health, GENEVE routes, policy installation and server bootstrap |
| Page loads but no blinking | Start traffic, check session-start logging and private syslog delivery |

To confirm FortiGate sends telemetry:

```text
diagnose sniffer packet any "host 10.50.0.11 and port 5514" 4
```

Stop with Ctrl+C. Packets leaving `port2` prove transmission, not reception. On the web server through Systems Manager Session Manager, inspect:

```bash
sudo systemctl status gwlb-demo.service
sudo journalctl -u gwlb-demo.service -n 100 --no-pager
```

## Checkpoint

- The provisioning template and template group exist.
- The policy-package script completed successfully and the package contains four rules.
- The existing onboarding rule assigns both the template group and populated package.
- Existing FortiGates have a successful installation and retain FortiManager connectivity.
- The web page loads and matched test traffic triggers FortiGate activity lights.

Continue to [Section 11: Validate Auto Onboarding](./section-10-validate-auto-onboarding.md).

## References

- [FortiManager CLI template positions](https://docs.fortinet.com/document/fortimanager/7.6.6/administration-guide/456678/adding-cli-templates)
- [Script execution targets](https://docs.fortinet.com/document/fortimanager/7.6.2/administration-guide/219334/add-a-script)
- [Default interface mapping](https://docs.fortinet.com/document/fortimanager/7.4.10/administration-guide/267078/per-device-and-per-platform-dynamic-mapping)
- [UMS auto-onboarding rule](https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/670005/creating-an-auto-onboarding-rule)
- [Installing policy packages and device settings](https://docs.fortinet.com/document/fortimanager/7.6.6/administration-guide/153046/installing-policy-packages-and-device-settings)
- [AWS Internet Gateway address translation](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html)
