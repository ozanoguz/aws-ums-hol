import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Section 4: Create the AWS Cloud SDN Connector","description":"","frontmatter":{},"headers":[],"relativePath":"section-4-aws-sdn-connector.md","filePath":"section-4-aws-sdn-connector.md","lastUpdated":1783673998000}');
const _sfc_main = { name: "section-4-aws-sdn-connector.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="section-4-create-the-aws-cloud-sdn-connector" tabindex="-1">Section 4: Create the AWS Cloud SDN Connector <a class="header-anchor" href="#section-4-create-the-aws-cloud-sdn-connector" aria-label="Permalink to &quot;Section 4: Create the AWS Cloud SDN Connector&quot;">​</a></h1><p>The AWS Cloud SDN connector allows FortiManager to discover AWS resources including Auto Scaling Groups, VPCs, EC2 instances, and other AWS resources.</p><p>Follow the steps in the official Fortinet documentation below:</p><p><a href="https://docs.fortinet.com/document/fortimanager/7.6.5/administration-guide/390041/creating-aws-fabric-connectors" target="_blank" rel="noreferrer">Creating AWS SDN Connector</a></p><h2 id="suggested-values" tabindex="-1">Suggested Values <a class="header-anchor" href="#suggested-values" aria-label="Permalink to &quot;Suggested Values&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td>Name</td><td><code>student&lt;number&gt;-AWS-SDN-Connector</code></td></tr><tr><td>Cloud Provider</td><td>AWS</td></tr><tr><td>Authentication Type</td><td>Access Key</td></tr><tr><td>Access Key ID</td><td>Provided by instructor</td></tr><tr><td>Secret Access Key</td><td>Provided by instructor</td></tr><tr><td>Region</td><td><code>eu-central-1</code></td></tr></tbody></table><h2 id="save-and-test-the-connector" tabindex="-1">Save and Test the Connector <a class="header-anchor" href="#save-and-test-the-connector" aria-label="Permalink to &quot;Save and Test the Connector&quot;">​</a></h2><ol><li><p>Save the connector.</p></li><li><p>Test the connector.</p></li><li><p>Right-click and choose:</p></li></ol><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>View Connector Objects</span></span></code></pre></div><div class="tip custom-block"><p class="custom-block-title">Checkpoint</p><p>Confirm that FortiManager can discover AWS objects through the connector. The lab ASG does not exist until Section 9, and its FortiManager UMS group appears only after a FortiGate is authorized in Stage 2.</p></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("section-4-aws-sdn-connector.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const section4AwsSdnConnector = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  section4AwsSdnConnector as default
};
