import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"","description":"","frontmatter":{"layout":"home","hero":{"name":"AWS UMS (User Managed Scaling) Hands-On-Lab","text":"Deploy and Configure FortiManager UMS on AWS","tagline":"Hands-on lab guide for FortiManager, AWS SDN Connector, FortiFlex, Terraform, and UMS auto scaling.","actions":[{"theme":"brand","text":"Start Lab","link":"/introduction"}]},"features":[{"title":"FortiManager on AWS","details":"Deploy FortiManager-VM in AWS using CloudFormation."},{"title":"UMS Integration","details":"Configure AWS SDN Connector and User Managed Scaling integration."},{"title":"Terraform ASG","details":"Create infrastructure with an empty ASG, prepare FortiManager, then activate two FortiGates."},{"title":"FortiFlex","details":"Configure FortiFlex connector and Flex VM licensing workflow."}]},"headers":[],"relativePath":"index.md","filePath":"index.md","lastUpdated":1781604472000}');
const _sfc_main = { name: "index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
