import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Section 3: Create a FortiManager API Administrator","description":"","frontmatter":{},"headers":[],"relativePath":"section-3-api-admin.md","filePath":"section-3-api-admin.md","lastUpdated":1781593706000}');
const _sfc_main = { name: "section-3-api-admin.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="section-3-create-a-fortimanager-api-administrator" tabindex="-1">Section 3: Create a FortiManager API Administrator <a class="header-anchor" href="#section-3-create-a-fortimanager-api-administrator" aria-label="Permalink to &quot;Section 3: Create a FortiManager API Administrator&quot;">​</a></h1><p>The API administrator is used by FortiGate devices to request licensing and onboarding from FortiManager.</p><p>Follow the steps in the official Fortinet documentation below:</p><p><a href="https://docs.fortinet.com/document/fortimanager-public-cloud/7.6.0/aws-administration-guide/902153/creating-an-api-admin-user" target="_blank" rel="noreferrer">Create a FortiManager API Administrator</a></p><div class="warning custom-block"><p class="custom-block-title">Important</p><p>Copy the API key and save it in your private lab notes. Keep the credentials for further steps.</p></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("section-3-api-admin.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const section3ApiAdmin = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  section3ApiAdmin as default
};
