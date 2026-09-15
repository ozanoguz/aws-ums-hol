import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Section 6: Creating a FortiFlex Connector","description":"","frontmatter":{},"headers":[],"relativePath":"section-6-fortiflex-connector.md","filePath":"section-6-fortiflex-connector.md","lastUpdated":1781646810000}');
const _sfc_main = { name: "section-6-fortiflex-connector.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="section-6-creating-a-fortiflex-connector" tabindex="-1">Section 6: Creating a FortiFlex Connector <a class="header-anchor" href="#section-6-creating-a-fortiflex-connector" aria-label="Permalink to &quot;Section 6: Creating a FortiFlex Connector&quot;">​</a></h1><p>Complete the FortiFlex connector configuration as provided by your instructor.</p><hr><h2 id="create-a-fortiflex-connector" tabindex="-1">Create a FortiFlex Connector <a class="header-anchor" href="#create-a-fortiflex-connector" aria-label="Permalink to &quot;Create a FortiFlex Connector&quot;">​</a></h2><p>Complete this option using the provided FortiFlex API credentials.</p><p>Follow the steps in the official Fortinet documentation below:</p><p><a href="https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/729208" target="_blank" rel="noreferrer">Create a FortiFlex Connector</a></p><div class="warning custom-block"><p class="custom-block-title">Important</p><p>You can skip &quot;FortiCloud&quot; related steps. FortiFlex API credentials are already provided by the instructor.</p></div><p>Configure the connector using the official Fortinet documentation below:</p><p><a href="https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/379795/fortiflex-connector-with-a-specific-configuration-id" target="_blank" rel="noreferrer">Configuring FortiFlex Connector</a></p><h2 id="suggested-values" tabindex="-1">Suggested Values <a class="header-anchor" href="#suggested-values" aria-label="Permalink to &quot;Suggested Values&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody><tr><td>Name</td><td><code>student&lt;number&gt;-Fortiflex-Connector</code></td></tr><tr><td>API User</td><td>Provided by instructor</td></tr><tr><td>API Password</td><td>Provided by instructor</td></tr><tr><td>Program SN</td><td>Provided by instructor</td></tr><tr><td>Default Config</td><td>FGT-UMS-VM04</td></tr></tbody></table><p>Save the connector.</p><h2 id="checkpoint" tabindex="-1">Checkpoint <a class="header-anchor" href="#checkpoint" aria-label="Permalink to &quot;Checkpoint&quot;">​</a></h2><p>Confirm the following:</p><ul><li>FortiFlex connector exists.</li><li>Connector test succeeds.</li><li>Auto onboarding rule is configured to use Flex VM licensing.</li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("section-6-fortiflex-connector.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const section6FortiflexConnector = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  section6FortiflexConnector as default
};
