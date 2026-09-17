# Section 13: Troubleshooting

## Start with the Failed Stage

| Symptom | Check |
|---|---|
| Stage 1 has no FortiGates | Expected with `deployment_stage = "infrastructure"`; complete FortiManager setup, then activate in Section 10, Step 7 |
| `Output "web_demo" not found` | Check the original state/workspace, the enabled `web_demo` block and a successful apply; null outputs are omitted from state |
| Terraform launches only one FortiGate or cannot scale to three | In `asgs.fgt_byol_asg`, verify min/desired `2` and max `3`; review and apply the updated plan before the scaling exercise |
| Device does not register | FortiManager IP/serial, registration API key, network reachability, UMS connector and matching onboarding administrator |
| Registration succeeds but the policy package is empty | Run the Section 10 policy script against **Policy Package or ADOM Database → GWLB-Web-Demo**; saving a script does not execute it |
| `config dynamic interface` fails with `object unrecognized` | The script was run against a device database; use the policy-package target |
| Rules exist in FortiManager but not on FortiGate | Assign the package/template group and use **Install Policy Package & Device Settings**; inspect the task error and install preview |
| Policy installation reports missing tunnel interfaces | Verify the GENEVE template uses **Pre-VDOM Copy** and the normalized interface mappings resolve to the real tunnel names |
| HTTP demo unavailable | Use the Terraform `web_demo.url` over HTTP; check public TCP/80 ingress, healthy GWLB targets, tunnel/routes, outbound HTTP/HTTPS policy and server bootstrap |
| Page loads but lights do not flash | Select **Start traffic**; verify all-session/session-start logging, syslogd2, private peering and collector UDP 5514 |
| Only some FortiGates flash | Verify fresh probe connections and healthy/eligible GWLB targets; flow hashing is not round-robin and does not guarantee even distribution |
| Third instance appears but is not operational | Check FortiFlex capacity, onboarding tasks, template/package installation and GWLB target health |

Use the task error from the first failed stage rather than repeating registration or replacing resources. Existing devices need an explicit install after an onboarding-rule change.

## Web Server Checks

On the demo server through Systems Manager Session Manager:

```bash
sudo systemctl status gwlb-demo.service
sudo journalctl -u gwlb-demo-install.service -u gwlb-demo.service -n 100 --no-pager
```

Bootstrap retries every minute if outbound access was unavailable before policy installation.

On FortiGate, confirm private telemetry transmission (default demo CIDR):

```text
diagnose sniffer packet any "host 10.50.0.11 and port 5514" 4
```

Stop with Ctrl+C. Packets leaving `port2` prove transmission, not delivery. The collector address is `10.50.0.11`; the inspected HTTP server is `10.50.0.10`. Do not route the HTTP host over the management peering path.

## Useful FortiManager Debug Commands

Use these only if instructed:

```text
diag debug reset
diag debug application fgfmsd 255
diag debug time enable
diag debug en
diag debug service sys 255
```

To stop debugging:

```text
diag debug disable
diag debug reset
```
