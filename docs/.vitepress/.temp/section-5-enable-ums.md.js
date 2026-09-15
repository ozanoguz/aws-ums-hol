import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Section 5: Enable the SDN Connector for UMS","description":"","frontmatter":{},"headers":[],"relativePath":"section-5-enable-ums.md","filePath":"section-5-enable-ums.md","lastUpdated":1781593706000}');
const _sfc_main = { name: "section-5-enable-ums.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="section-5-enable-the-sdn-connector-for-ums" tabindex="-1">Section 5: Enable the SDN Connector for UMS <a class="header-anchor" href="#section-5-enable-the-sdn-connector-for-ums" aria-label="Permalink to &quot;Section 5: Enable the SDN Connector for UMS&quot;">​</a></h1><p>Follow the steps in the official Fortinet documentation below:</p><p><a href="https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/115674" target="_blank" rel="noreferrer">Enable the SDN Connector for UMS</a></p><h2 id="checkpoint" tabindex="-1">Checkpoint <a class="header-anchor" href="#checkpoint" aria-label="Permalink to &quot;Checkpoint&quot;">​</a></h2><p>Confirm the following:</p><ul><li>The AWS SDN connector is enabled for UMS.</li><li>FortiManager can use the connector for auto-onboarding.</li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("section-5-enable-ums.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const section5EnableUms = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  section5EnableUms as default
};
