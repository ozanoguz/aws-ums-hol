# Section 10: Configure FortiManager Templates and the Policy Package

After the Terraform deployment in [Section 9](./section-9-terraform-asg.md), configure FortiManager to provision the GWLB inspection path and the web demo. Create these configurations once, install them on the existing FortiGates, and assign them to the existing auto-onboarding rule for future ASG members.

## Objectives

- Create a CLI provisioning template for GENEVE tunnels, routing and private syslog.
- Populate a FortiManager policy package with address objects, interface mappings and firewall rules.
- Update the existing UMS onboarding rule without changing its FortiFlex licensing configuration.
- Install the configuration on already registered devices and test the web demo.

## Step 1: Collect Your Deployment Values

Use the same ADOM as the existing onboarding rule, normally `root`. This section assumes the lab's two-arm FortiGates with a root VDOM, `port1` for GWLB traffic and `port2` for management. It uses a dedicated policy package with policy-based NGFW and central NAT disabled.

From the Terraform example directory, run:

```bash
terraform output -json web_demo
```

Record `url` and `collector_private_ip`. A `null` output means the demo was not enabled; return to Section 9 and deploy it before continuing. The HTTP server uses `10.50.0.10` and the private collector uses `10.50.0.11` when `web_demo.vpc_cidr` is `10.50.0.0/16`.

Find the GWLB node addresses in the AWS Console:

1. Under **EC2 → Load Balancers**, select this lab's **Gateway Load Balancer** and note its VPC, Availability Zones, subnets and ARN suffix (`gwy/name/id`).
2. Under **EC2 → Network Interfaces**, filter by that VPC. Locate the load balancer interfaces whose descriptions identify the same GWLB, usually `ELB gwy/name/id`.
3. Match each interface's subnet/AZ to `availability_zones[0]` (AZ1) and `availability_zones[1]` (AZ2) in Terraform, and record its primary private IPv4 address. Use the GWLB node interfaces, not the FortiGate interfaces or GWLB endpoint interfaces.

| Script value | Replace with |
|---|---|
| `<GWLB_NODE_AZ1_PRIVATE_IP>` | Your GWLB node's private IP in AZ1 |
| `<GWLB_NODE_AZ2_PRIVATE_IP>` | Your GWLB node's private IP in AZ2 |
| `<YOUR_BROWSER_PUBLIC_IP>` | Your browser's public IPv4 address, matching the `/32` in `web_demo.allowed_client_cidrs` |
| `10.50.0.10` | Keep for the default demo VPC; otherwise use the HTTP server's actual primary private IP |
| `10.50.0.11` | Keep for the default demo VPC; otherwise use `collector_private_ip` from Terraform |

::: warning Replace values before running
The angle-bracket values below are placeholders, not FortiManager variables. Replace every occurrence before saving the scripts. Check your browser's IP from your own computer, not from Cloud9, which has a different Internet source address. For multiple allowed client CIDRs, create additional address objects with the appropriate masks and add them to `Demo-Clients`.
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

Create a **Template Group** named `GWLB-Web-Templates` under provisioning templates and add `GWLB-Web-Provisioning` to it.

The collector route intentionally uses `10.50.0.11/32`, not the HTTP server's `10.50.0.10`. The demo Terraform module provides the private VPC peering route and collector security group. Management-side security groups and NACLs must also permit this UDP traffic.

## Step 3: Create and Populate the Policy Package

First create an empty dedicated package named **GWLB-Web-Demo** under **Policy & Objects → Policy Packages**, in the same ADOM as the devices. Use it for the demo ASG; it does not reproduce unrelated policies from an existing package.

Then go to **Device Manager → Scripts → Create New → Script**:

| Field | Value |
|---|---|
| Name | `Create-Demo-Policies` |
| Type | **CLI Script** |
| Run Script on | **Policy Package or ADOM Database** |

Paste the following script after substituting the client IP and any changed demo addresses.

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
    edit "Demo-Client-1"
        set type ipmask
        set subnet <YOUR_BROWSER_PUBLIC_IP> 255.255.255.255
        set comment "Must match web_demo.allowed_client_cidrs"
    next
end

config firewall addrgrp
    edit "Demo-Clients"
        set member "Demo-Client-1"
    next
end

config firewall policy
    edit 1010
        set name "Demo-HTTP-AZ1"
        set status enable
        set srcintf "Demo-GENEVE-AZ1"
        set dstintf "Demo-GENEVE-AZ1"
        set srcaddr "Demo-Clients"
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
        set srcaddr "Demo-Clients"
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

**Saving is not execution.** After saving, right-click `Create-Demo-Policies` → **Run Script**, select **GWLB-Web-Demo** as the target package, and run it. The target must be the package, not a FortiGate serial number. Open the execution result and confirm success.

Refresh **Policy & Objects → Policy Packages → GWLB-Web-Demo** and verify:

| ID | Policy | Purpose |
|---|---|---|
| 1010 | Demo-HTTP-AZ1 | Allowed client → web server, HTTP, AZ1 tunnel |
| 1011 | Demo-Egress-AZ1 | Web server → Internet, HTTP/HTTPS, AZ1 tunnel |
| 1020 | Demo-HTTP-AZ2 | Allowed client → web server, HTTP, AZ2 tunnel |
| 1021 | Demo-Egress-AZ2 | Web server → Internet, HTTP/HTTPS, AZ2 tunnel |

All four rules disable NAT and enable all-session and session-start logging. Default normalized-interface mappings resolve to `geneve-az1` and `geneve-az2` for future devices without per-device mapping work. Stateful replies do not need separate reverse rules. These are connectivity and logging policies; security profiles are not included.

No FortiGate VIP is required: the AWS Internet Gateway translates the web server's Elastic IP to its private IP before delivery into the VPC. The policies therefore match `Demo-Web`. Syslog is generated locally by FortiGate and needs no forward-traffic policy. `Demo-Syslog` documents the collector address; it may not be installed as an address object because no firewall rule references it.

## Step 4: Update the Existing Auto-Onboarding Rule

1. Go to **Device Manager → Device & Groups → Add Device dropdown → Auto Onboarding**.
2. Edit the rule created in Section 7. Keep its matching API administrator, ADOM, device group, **Flex VM** licensing and FortiFlex connector settings.
3. Under **Install Configuration**, select **Manual Configuration**.
4. Select template group **GWLB-Web-Templates** and policy package **GWLB-Web-Demo**.
5. Save the rule.

The package must already contain the four rules before a new FortiGate onboards. A script saved under Device Manager is not automatically run to populate a package by the onboarding rule.

Future matching ASG instances receive the provisioning template and policy package through onboarding. Adding a third FortiGate does not require a third GENEVE tunnel: all FortiGates use the same deployed GWLB node addresses. Recheck the addresses if the GWLB is recreated.

## Step 5: Install on the FortiGates Already Registered

Terraform has already launched devices before this section. Updating the onboarding rule does not retroactively install the new configuration on those devices.

1. Assign **GWLB-Web-Templates** to the existing demo FortiGates.
2. Open **Install Wizard** and choose **Install Policy Package & Device Settings**.
3. Select **GWLB-Web-Demo** and the existing demo FortiGates/root VDOM as installation targets. Ensure the rules' **Install On** settings do not exclude them.
4. Review **Install Preview**: it must include the tunnel/routing configuration and four firewall policies, with normalized interfaces resolved to `geneve-az1` and `geneve-az2`. Confirm the management route and registration settings remain correct.
5. Install and check the final task status for every device.

On a FortiGate in the root VDOM, verify:

```text
show system geneve
show firewall policy
get router info routing-table all
show log syslogd2 setting
```

Check the route to your FortiManager IP resolves through `port2`. If an installation fails, read its task error before proceeding to scale-out.

## Step 6: Test the Web Page and Activity Lights

Open the `url` from `terraform output -json web_demo` using **HTTP** from your allowed external browser IP. Click **Start traffic**. The destination is the web server's Elastic IP, not FortiManager's IP or a FortiGate management IP.

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
| Page unreachable | Client CIDR in both Terraform and policy, GWLB health, GENEVE routes, policy installation and server bootstrap |
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
