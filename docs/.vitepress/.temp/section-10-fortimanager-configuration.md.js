import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Section 10: Configure FortiManager Templates and the Policy Package","description":"","frontmatter":{},"headers":[],"relativePath":"section-10-fortimanager-configuration.md","filePath":"section-10-fortimanager-configuration.md","lastUpdated":1789500406000}');
const _sfc_main = { name: "section-10-fortimanager-configuration.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="section-10-configure-fortimanager-templates-and-the-policy-package" tabindex="-1">Section 10: Configure FortiManager Templates and the Policy Package <a class="header-anchor" href="#section-10-configure-fortimanager-templates-and-the-policy-package" aria-label="Permalink to &quot;Section 10: Configure FortiManager Templates and the Policy Package&quot;">​</a></h1><p>After the Terraform deployment in <a href="./section-9-terraform-asg">Section 9</a>, configure FortiManager to provision the GWLB inspection path and the web demo. Create these configurations once, install them on the existing FortiGates, and assign them to the existing auto-onboarding rule for future ASG members.</p><h2 id="objectives" tabindex="-1">Objectives <a class="header-anchor" href="#objectives" aria-label="Permalink to &quot;Objectives&quot;">​</a></h2><ul><li>Create a CLI provisioning template for GENEVE tunnels, routing and private syslog.</li><li>Populate a FortiManager policy package with address objects, interface mappings and firewall rules.</li><li>Update the existing UMS onboarding rule without changing its FortiFlex licensing configuration.</li><li>Install the configuration on already registered devices and test the web demo.</li></ul><h2 id="step-1-collect-your-deployment-values" tabindex="-1">Step 1: Collect Your Deployment Values <a class="header-anchor" href="#step-1-collect-your-deployment-values" aria-label="Permalink to &quot;Step 1: Collect Your Deployment Values&quot;">​</a></h2><p>Use the same ADOM as the existing onboarding rule, normally <code>root</code>. This section assumes the lab&#39;s two-arm FortiGates with a root VDOM, <code>port1</code> for GWLB traffic and <code>port2</code> for management. It uses a dedicated policy package with policy-based NGFW and central NAT disabled.</p><p>From the Terraform example directory, run:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">terraform</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> output</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> -json</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> web_demo</span></span></code></pre></div><p>Record <code>url</code> and <code>collector_private_ip</code>. A <code>null</code> output means the demo was disabled in your local variables. Restore the supplied <code>web_demo</code> configuration and apply it from the same Terraform workspace before continuing. The HTTP server uses <code>10.50.0.10</code> and the private collector uses <code>10.50.0.11</code> when <code>web_demo.vpc_cidr</code> is <code>10.50.0.0/16</code>.</p><p>Find the GWLB node addresses in the AWS Console:</p><ol><li>Under <strong>EC2 → Load Balancers</strong>, select this lab&#39;s <strong>Gateway Load Balancer</strong> and note its VPC, Availability Zones, subnets and ARN suffix (<code>gwy/name/id</code>).</li><li>Under <strong>EC2 → Network Interfaces</strong>, filter by that VPC. Locate the load balancer interfaces whose descriptions identify the same GWLB, usually <code>ELB gwy/name/id</code>.</li><li>Match each interface&#39;s subnet/AZ to <code>availability_zones[0]</code> (AZ1) and <code>availability_zones[1]</code> (AZ2) in Terraform, and record its primary private IPv4 address. Use the GWLB node interfaces, not the FortiGate interfaces or GWLB endpoint interfaces.</li></ol><table tabindex="0"><thead><tr><th>Script value</th><th>Replace with</th></tr></thead><tbody><tr><td><code>&lt;GWLB_NODE_AZ1_PRIVATE_IP&gt;</code></td><td>Your GWLB node&#39;s private IP in AZ1</td></tr><tr><td><code>&lt;GWLB_NODE_AZ2_PRIVATE_IP&gt;</code></td><td>Your GWLB node&#39;s private IP in AZ2</td></tr><tr><td><code>10.50.0.10</code></td><td>Keep for the default demo VPC; otherwise use the HTTP server&#39;s actual primary private IP</td></tr><tr><td><code>10.50.0.11</code></td><td>Keep for the default demo VPC; otherwise use <code>collector_private_ip</code> from Terraform</td></tr></tbody></table><div class="warning custom-block"><p class="custom-block-title">Replace values before running</p><p>The angle-bracket values below are placeholders, not FortiManager variables. Replace every occurrence before saving the scripts. HTTP/80 is public (<code>0.0.0.0/0</code>) so browsers and the instructor monitoring service can reach each student deployment. The policy uses source <code>all</code>; no client-IP substitution is needed. Syslog remains private.</p></div><h2 id="step-2-create-the-geneve-routes-and-syslog-cli-template" tabindex="-1">Step 2: Create the GENEVE, Routes and Syslog CLI Template <a class="header-anchor" href="#step-2-create-the-geneve-routes-and-syslog-cli-template" aria-label="Permalink to &quot;Step 2: Create the GENEVE, Routes and Syslog CLI Template&quot;">​</a></h2><ol><li>Go to <strong>Device Manager → Provisioning Templates → CLI</strong>.</li><li>Select <strong>Create New → CLI Template</strong>, not <strong>Pre-Run CLI Template</strong>.</li><li>Name it <code>GWLB-Web-Provisioning</code>, select <strong>CLI Script</strong>, and set <strong>Position → Pre-VDOM Copy</strong>. This applies the tunnel configuration before the policy package during installation.</li><li>Paste the script below after replacing your deployment values, then save.</li></ol><p>Reserve static route IDs <code>101</code>, <code>102</code>, <code>111</code>, <code>112</code>, <code>190</code>, policy route IDs <code>101</code>, <code>102</code>, and <code>syslogd2</code> for this lab. Reconcile existing entries at these IDs instead of overwriting unrelated configurations. If a prior lab template configures these same tunnels or routes, update/replace its assignment so only one template owns them.</p><p>The template relies on the bootstrap configuration: <code>port1</code> uses DHCP with distance 6; <code>port2</code> has a DHCP management default route with distance 5 and priority lower than 100. Preserve that management route and the existing FortiManager registration/UMS settings.</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>config system geneve</span></span>
<span class="line"><span>    edit &quot;geneve-az1&quot;</span></span>
<span class="line"><span>        set interface &quot;port1&quot;</span></span>
<span class="line"><span>        set type ppp</span></span>
<span class="line"><span>        set remote-ip &lt;GWLB_NODE_AZ1_PRIVATE_IP&gt;</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>    edit &quot;geneve-az2&quot;</span></span>
<span class="line"><span>        set interface &quot;port1&quot;</span></span>
<span class="line"><span>        set type ppp</span></span>
<span class="line"><span>        set remote-ip &lt;GWLB_NODE_AZ2_PRIVATE_IP&gt;</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>config router static</span></span>
<span class="line"><span>    edit 101</span></span>
<span class="line"><span>        set dst &lt;GWLB_NODE_AZ1_PRIVATE_IP&gt; 255.255.255.255</span></span>
<span class="line"><span>        set device &quot;port1&quot;</span></span>
<span class="line"><span>        set dynamic-gateway enable</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>    edit 102</span></span>
<span class="line"><span>        set dst &lt;GWLB_NODE_AZ2_PRIVATE_IP&gt; 255.255.255.255</span></span>
<span class="line"><span>        set device &quot;port1&quot;</span></span>
<span class="line"><span>        set dynamic-gateway enable</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>    edit 111</span></span>
<span class="line"><span>        set dst 0.0.0.0 0.0.0.0</span></span>
<span class="line"><span>        set distance 5</span></span>
<span class="line"><span>        set priority 100</span></span>
<span class="line"><span>        set device &quot;geneve-az1&quot;</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>    edit 112</span></span>
<span class="line"><span>        set dst 0.0.0.0 0.0.0.0</span></span>
<span class="line"><span>        set distance 5</span></span>
<span class="line"><span>        set priority 100</span></span>
<span class="line"><span>        set device &quot;geneve-az2&quot;</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>    edit 190</span></span>
<span class="line"><span>        set dst 10.50.0.11 255.255.255.255</span></span>
<span class="line"><span>        set device &quot;port2&quot;</span></span>
<span class="line"><span>        set dynamic-gateway enable</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>config router policy</span></span>
<span class="line"><span>    edit 101</span></span>
<span class="line"><span>        set input-device &quot;geneve-az1&quot;</span></span>
<span class="line"><span>        set src &quot;0.0.0.0/0.0.0.0&quot;</span></span>
<span class="line"><span>        set dst &quot;0.0.0.0/0.0.0.0&quot;</span></span>
<span class="line"><span>        set output-device &quot;geneve-az1&quot;</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>    edit 102</span></span>
<span class="line"><span>        set input-device &quot;geneve-az2&quot;</span></span>
<span class="line"><span>        set src &quot;0.0.0.0/0.0.0.0&quot;</span></span>
<span class="line"><span>        set dst &quot;0.0.0.0/0.0.0.0&quot;</span></span>
<span class="line"><span>        set output-device &quot;geneve-az2&quot;</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>config log syslogd2 setting</span></span>
<span class="line"><span>    set status enable</span></span>
<span class="line"><span>    set server &quot;10.50.0.11&quot;</span></span>
<span class="line"><span>    set mode udp</span></span>
<span class="line"><span>    set port 5514</span></span>
<span class="line"><span>    set format default</span></span>
<span class="line"><span>    set interface-select-method specify</span></span>
<span class="line"><span>    set interface &quot;port2&quot;</span></span>
<span class="line"><span>end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>config log syslogd2 filter</span></span>
<span class="line"><span>    set severity information</span></span>
<span class="line"><span>    set forward-traffic enable</span></span>
<span class="line"><span>end</span></span></code></pre></div><p>Create a <strong>Template Group</strong> named <code>GWLB-Web-Templates</code> under provisioning templates and add <code>GWLB-Web-Provisioning</code> to it.</p><p>The collector route intentionally uses <code>10.50.0.11/32</code>, not the HTTP server&#39;s <code>10.50.0.10</code>. The demo Terraform module provides the private VPC peering route and collector security group. Management-side security groups and NACLs must also permit this UDP traffic.</p><h2 id="step-3-create-and-populate-the-policy-package" tabindex="-1">Step 3: Create and Populate the Policy Package <a class="header-anchor" href="#step-3-create-and-populate-the-policy-package" aria-label="Permalink to &quot;Step 3: Create and Populate the Policy Package&quot;">​</a></h2><p>First create an empty dedicated package named <strong>GWLB-Web-Demo</strong> under <strong>Policy &amp; Objects → Policy Packages</strong>, in the same ADOM as the devices. Use it for the demo ASG; it does not reproduce unrelated policies from an existing package.</p><p>Then go to <strong>Device Manager → Scripts → Create New → Script</strong>:</p><table tabindex="0"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td>Name</td><td><code>Create-Demo-Policies</code></td></tr><tr><td>Type</td><td><strong>CLI Script</strong></td></tr><tr><td>Run Script on</td><td><strong>Policy Package or ADOM Database</strong></td></tr></tbody></table><p>Paste the following script after substituting any changed demo addresses.</p><div class="warning custom-block"><p class="custom-block-title">Script target matters</p><p>This is a FortiManager policy-package script, not a device provisioning template. Do not select <strong>Device Database</strong> or <strong>Remote FortiGate Directly</strong>. <code>config dynamic interface</code> belongs to the FortiManager ADOM database; a device-database execution fails with <code>object unrecognized</code> on line 1.</p></div><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>config dynamic interface</span></span>
<span class="line"><span>    edit &quot;Demo-GENEVE-AZ1&quot;</span></span>
<span class="line"><span>        set default-mapping enable</span></span>
<span class="line"><span>        set defmap-intf &quot;geneve-az1&quot;</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>    edit &quot;Demo-GENEVE-AZ2&quot;</span></span>
<span class="line"><span>        set default-mapping enable</span></span>
<span class="line"><span>        set defmap-intf &quot;geneve-az2&quot;</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>config firewall address</span></span>
<span class="line"><span>    edit &quot;Demo-Web&quot;</span></span>
<span class="line"><span>        set type ipmask</span></span>
<span class="line"><span>        set subnet 10.50.0.10 255.255.255.255</span></span>
<span class="line"><span>        set comment &quot;Spoke web server private IP; AWS EIP translation occurs at IGW&quot;</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>    edit &quot;Demo-Syslog&quot;</span></span>
<span class="line"><span>        set type ipmask</span></span>
<span class="line"><span>        set subnet 10.50.0.11 255.255.255.255</span></span>
<span class="line"><span>        set comment &quot;Private collector; FortiGate local-out UDP 5514 through port2&quot;</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>end</span></span>
<span class="line"><span></span></span>
<span class="line"><span>config firewall policy</span></span>
<span class="line"><span>    edit 1010</span></span>
<span class="line"><span>        set name &quot;Demo-HTTP-AZ1&quot;</span></span>
<span class="line"><span>        set status enable</span></span>
<span class="line"><span>        set srcintf &quot;Demo-GENEVE-AZ1&quot;</span></span>
<span class="line"><span>        set dstintf &quot;Demo-GENEVE-AZ1&quot;</span></span>
<span class="line"><span>        set srcaddr &quot;all&quot;</span></span>
<span class="line"><span>        set dstaddr &quot;Demo-Web&quot;</span></span>
<span class="line"><span>        set action accept</span></span>
<span class="line"><span>        set schedule &quot;always&quot;</span></span>
<span class="line"><span>        set service &quot;HTTP&quot;</span></span>
<span class="line"><span>        set nat disable</span></span>
<span class="line"><span>        set logtraffic all</span></span>
<span class="line"><span>        set logtraffic-start enable</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>    edit 1011</span></span>
<span class="line"><span>        set name &quot;Demo-Egress-AZ1&quot;</span></span>
<span class="line"><span>        set status enable</span></span>
<span class="line"><span>        set srcintf &quot;Demo-GENEVE-AZ1&quot;</span></span>
<span class="line"><span>        set dstintf &quot;Demo-GENEVE-AZ1&quot;</span></span>
<span class="line"><span>        set srcaddr &quot;Demo-Web&quot;</span></span>
<span class="line"><span>        set dstaddr &quot;all&quot;</span></span>
<span class="line"><span>        set action accept</span></span>
<span class="line"><span>        set schedule &quot;always&quot;</span></span>
<span class="line"><span>        set service &quot;HTTP&quot; &quot;HTTPS&quot;</span></span>
<span class="line"><span>        set nat disable</span></span>
<span class="line"><span>        set logtraffic all</span></span>
<span class="line"><span>        set logtraffic-start enable</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>    edit 1020</span></span>
<span class="line"><span>        set name &quot;Demo-HTTP-AZ2&quot;</span></span>
<span class="line"><span>        set status enable</span></span>
<span class="line"><span>        set srcintf &quot;Demo-GENEVE-AZ2&quot;</span></span>
<span class="line"><span>        set dstintf &quot;Demo-GENEVE-AZ2&quot;</span></span>
<span class="line"><span>        set srcaddr &quot;all&quot;</span></span>
<span class="line"><span>        set dstaddr &quot;Demo-Web&quot;</span></span>
<span class="line"><span>        set action accept</span></span>
<span class="line"><span>        set schedule &quot;always&quot;</span></span>
<span class="line"><span>        set service &quot;HTTP&quot;</span></span>
<span class="line"><span>        set nat disable</span></span>
<span class="line"><span>        set logtraffic all</span></span>
<span class="line"><span>        set logtraffic-start enable</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>    edit 1021</span></span>
<span class="line"><span>        set name &quot;Demo-Egress-AZ2&quot;</span></span>
<span class="line"><span>        set status enable</span></span>
<span class="line"><span>        set srcintf &quot;Demo-GENEVE-AZ2&quot;</span></span>
<span class="line"><span>        set dstintf &quot;Demo-GENEVE-AZ2&quot;</span></span>
<span class="line"><span>        set srcaddr &quot;Demo-Web&quot;</span></span>
<span class="line"><span>        set dstaddr &quot;all&quot;</span></span>
<span class="line"><span>        set action accept</span></span>
<span class="line"><span>        set schedule &quot;always&quot;</span></span>
<span class="line"><span>        set service &quot;HTTP&quot; &quot;HTTPS&quot;</span></span>
<span class="line"><span>        set nat disable</span></span>
<span class="line"><span>        set logtraffic all</span></span>
<span class="line"><span>        set logtraffic-start enable</span></span>
<span class="line"><span>    next</span></span>
<span class="line"><span>end</span></span></code></pre></div><p><strong>Saving is not execution.</strong> After saving, right-click <code>Create-Demo-Policies</code> → <strong>Run Script</strong>, select <strong>GWLB-Web-Demo</strong> as the target package, and run it. The target must be the package, not a FortiGate serial number. Open the execution result and confirm success.</p><p>Refresh <strong>Policy &amp; Objects → Policy Packages → GWLB-Web-Demo</strong> and verify:</p><table tabindex="0"><thead><tr><th>ID</th><th>Policy</th><th>Purpose</th></tr></thead><tbody><tr><td>1010</td><td>Demo-HTTP-AZ1</td><td>Any IPv4 client → web server, HTTP, AZ1 tunnel</td></tr><tr><td>1011</td><td>Demo-Egress-AZ1</td><td>Web server → Internet, HTTP/HTTPS, AZ1 tunnel</td></tr><tr><td>1020</td><td>Demo-HTTP-AZ2</td><td>Any IPv4 client → web server, HTTP, AZ2 tunnel</td></tr><tr><td>1021</td><td>Demo-Egress-AZ2</td><td>Web server → Internet, HTTP/HTTPS, AZ2 tunnel</td></tr></tbody></table><p>All four rules disable NAT and enable all-session and session-start logging. Default normalized-interface mappings resolve to <code>geneve-az1</code> and <code>geneve-az2</code> for future devices without per-device mapping work. Stateful replies do not need separate reverse rules. These are connectivity and logging policies; security profiles are not included.</p><p>No FortiGate VIP is required: the AWS Internet Gateway translates the web server&#39;s Elastic IP to its private IP before delivery into the VPC. The policies therefore match <code>Demo-Web</code>. Syslog is generated locally by FortiGate and needs no forward-traffic policy. <code>Demo-Syslog</code> documents the collector address; it may not be installed as an address object because no firewall rule references it.</p><h2 id="step-4-update-the-existing-auto-onboarding-rule" tabindex="-1">Step 4: Update the Existing Auto-Onboarding Rule <a class="header-anchor" href="#step-4-update-the-existing-auto-onboarding-rule" aria-label="Permalink to &quot;Step 4: Update the Existing Auto-Onboarding Rule&quot;">​</a></h2><ol><li>Go to <strong>Device Manager → Device &amp; Groups → Add Device dropdown → Auto Onboarding</strong>.</li><li>Edit the rule created in Section 7. Keep its matching API administrator, ADOM, device group, <strong>Flex VM</strong> licensing and FortiFlex connector settings.</li><li>Under <strong>Install Configuration</strong>, select <strong>Manual Configuration</strong>.</li><li>Select template group <strong>GWLB-Web-Templates</strong> and policy package <strong>GWLB-Web-Demo</strong>.</li><li>Save the rule.</li></ol><p>The package must already contain the four rules before a new FortiGate onboards. A script saved under Device Manager is not automatically run to populate a package by the onboarding rule.</p><p>Future matching ASG instances receive the provisioning template and policy package through onboarding. Adding a third FortiGate does not require a third GENEVE tunnel: all FortiGates use the same deployed GWLB node addresses. Recheck the addresses if the GWLB is recreated.</p><h2 id="step-5-install-on-the-fortigates-already-registered" tabindex="-1">Step 5: Install on the FortiGates Already Registered <a class="header-anchor" href="#step-5-install-on-the-fortigates-already-registered" aria-label="Permalink to &quot;Step 5: Install on the FortiGates Already Registered&quot;">​</a></h2><p>Terraform has already launched devices before this section. Updating the onboarding rule does not retroactively install the new configuration on those devices.</p><ol><li>Assign <strong>GWLB-Web-Templates</strong> to the existing demo FortiGates.</li><li>Open <strong>Install Wizard</strong> and choose <strong>Install Policy Package &amp; Device Settings</strong>.</li><li>Select <strong>GWLB-Web-Demo</strong> and the existing demo FortiGates/root VDOM as installation targets. Ensure the rules&#39; <strong>Install On</strong> settings do not exclude them.</li><li>Review <strong>Install Preview</strong>: it must include the tunnel/routing configuration and four firewall policies, with normalized interfaces resolved to <code>geneve-az1</code> and <code>geneve-az2</code>. Confirm the management route and registration settings remain correct.</li><li>Install and check the final task status for every device.</li></ol><p>On a FortiGate in the root VDOM, verify:</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>show system geneve</span></span>
<span class="line"><span>show firewall policy</span></span>
<span class="line"><span>get router info routing-table all</span></span>
<span class="line"><span>show log syslogd2 setting</span></span></code></pre></div><p>Check the route to your FortiManager IP resolves through <code>port2</code>. If an installation fails, read its task error before proceeding to scale-out.</p><h3 id="updating-an-existing-restricted-deployment" tabindex="-1">Updating an Existing Restricted Deployment <a class="header-anchor" href="#updating-an-existing-restricted-deployment" aria-label="Permalink to &quot;Updating an Existing Restricted Deployment&quot;">​</a></h3><p>Set <code>web_demo.allowed_client_cidrs = [&quot;0.0.0.0/0&quot;]</code> in Terraform, then review <code>terraform plan</code> and apply it. Re-run the updated policy-package script against <code>GWLB-Web-Demo</code> and install the package on existing FortiGates. Policies 1010 and 1020 now use source <code>all</code>; previously created <code>Demo-Clients</code> objects can remain unused. Keep the updated package assigned to the onboarding rule. Both the AWS security group and FortiGate policy must allow public HTTP.</p><h2 id="step-6-test-the-web-page-and-activity-lights" tabindex="-1">Step 6: Test the Web Page and Activity Lights <a class="header-anchor" href="#step-6-test-the-web-page-and-activity-lights" aria-label="Permalink to &quot;Step 6: Test the Web Page and Activity Lights&quot;">​</a></h2><p>Open the <code>url</code> from <code>terraform output -json web_demo</code> using <strong>HTTP</strong> from an external browser or monitoring service. Click <strong>Start traffic</strong>. The destination is the web server&#39;s Elastic IP, not FortiManager&#39;s IP or a FortiGate management IP.</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Browser → web EIP / spoke IGW → GWLBE → GWLB → selected FortiGate</span></span>
<span class="line"><span>                                                     ↓</span></span>
<span class="line"><span>Web server 10.50.0.10 ← GWLBE ← GWLB ← inspected traffic</span></span>
<span class="line"><span></span></span>
<span class="line"><span>FortiGate port2 → private peering → 10.50.0.11:5514 → activity correlation</span></span></code></pre></div><p>The web server responds to HTTP requests; FortiGates inspect them. The dashboard discovers ASG members and matches test connections to FortiGate syslog records. A new member gets a card automatically; it blinks only after receiving an eligible test flow and its log reaches the collector. GWLB flow hashing does not guarantee an even distribution, and cross-zone/AZ eligibility affects which targets receive traffic.</p><p>If outbound connectivity was unavailable before the policy installation, allow a few minutes for the web server installer: it retries every minute.</p><table tabindex="0"><thead><tr><th>Symptom</th><th>Check</th></tr></thead><tbody><tr><td>Policy package empty</td><td>Execute <code>Create-Demo-Policies</code> against the package; saving alone is insufficient</td></tr><tr><td><code>config dynamic interface</code> / <code>object unrecognized</code></td><td>Change the script target from Device Database to Policy Package or ADOM Database</td></tr><tr><td>Policies in FortiManager but absent from FortiGate</td><td>Run Install Policy Package &amp; Device Settings and inspect the task result</td></tr><tr><td>Interface mapping/install error</td><td>Check default mappings and the Pre-VDOM Copy template&#39;s tunnel creation</td></tr><tr><td>Page unreachable</td><td>Public HTTP/80 security-group rule, GWLB health, GENEVE routes, policy installation and server bootstrap</td></tr><tr><td>Page loads but no blinking</td><td>Start traffic, check session-start logging and private syslog delivery</td></tr></tbody></table><p>To confirm FortiGate sends telemetry:</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>diagnose sniffer packet any &quot;host 10.50.0.11 and port 5514&quot; 4</span></span></code></pre></div><p>Stop with Ctrl+C. Packets leaving <code>port2</code> prove transmission, not reception. On the web server through Systems Manager Session Manager, inspect:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">sudo</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> systemctl</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> status</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> gwlb-demo.service</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#6F42C1", "--shiki-dark": "#B392F0" })}">sudo</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> journalctl</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> -u</span><span style="${ssrRenderStyle({ "--shiki-light": "#032F62", "--shiki-dark": "#9ECBFF" })}"> gwlb-demo.service</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> -n</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> 100</span><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-dark": "#79B8FF" })}"> --no-pager</span></span></code></pre></div><h2 id="checkpoint" tabindex="-1">Checkpoint <a class="header-anchor" href="#checkpoint" aria-label="Permalink to &quot;Checkpoint&quot;">​</a></h2><ul><li>The provisioning template and template group exist.</li><li>The policy-package script completed successfully and the package contains four rules.</li><li>The existing onboarding rule assigns both the template group and populated package.</li><li>Existing FortiGates have a successful installation and retain FortiManager connectivity.</li><li>The web page loads and matched test traffic triggers FortiGate activity lights.</li></ul><p>Continue to <a href="./section-10-validate-auto-onboarding">Section 11: Validate Auto Onboarding</a>.</p><h2 id="references" tabindex="-1">References <a class="header-anchor" href="#references" aria-label="Permalink to &quot;References&quot;">​</a></h2><ul><li><a href="https://docs.fortinet.com/document/fortimanager/7.6.6/administration-guide/456678/adding-cli-templates" target="_blank" rel="noreferrer">FortiManager CLI template positions</a></li><li><a href="https://docs.fortinet.com/document/fortimanager/7.6.2/administration-guide/219334/add-a-script" target="_blank" rel="noreferrer">Script execution targets</a></li><li><a href="https://docs.fortinet.com/document/fortimanager/7.4.10/administration-guide/267078/per-device-and-per-platform-dynamic-mapping" target="_blank" rel="noreferrer">Default interface mapping</a></li><li><a href="https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/670005/creating-an-auto-onboarding-rule" target="_blank" rel="noreferrer">UMS auto-onboarding rule</a></li><li><a href="https://docs.fortinet.com/document/fortimanager/7.6.6/administration-guide/153046/installing-policy-packages-and-device-settings" target="_blank" rel="noreferrer">Installing policy packages and device settings</a></li><li><a href="https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html" target="_blank" rel="noreferrer">AWS Internet Gateway address translation</a></li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("section-10-fortimanager-configuration.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const section10FortimanagerConfiguration = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  section10FortimanagerConfiguration as default
};
