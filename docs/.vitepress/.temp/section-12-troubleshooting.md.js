import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Section 13: Troubleshooting","description":"","frontmatter":{},"headers":[],"relativePath":"section-12-troubleshooting.md","filePath":"section-12-troubleshooting.md","lastUpdated":1789496344000}');
const _sfc_main = { name: "section-12-troubleshooting.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="section-13-troubleshooting" tabindex="-1">Section 13: Troubleshooting <a class="header-anchor" href="#section-13-troubleshooting" aria-label="Permalink to &quot;Section 13: Troubleshooting&quot;">​</a></h1><h2 id="useful-fortimanager-debug-commands" tabindex="-1">Useful FortiManager Debug Commands <a class="header-anchor" href="#useful-fortimanager-debug-commands" aria-label="Permalink to &quot;Useful FortiManager Debug Commands&quot;">​</a></h2><p>Use these only if instructed:</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>diag debug reset</span></span>
<span class="line"><span>diag debug application fgfmsd 255</span></span>
<span class="line"><span>diag debug time enable</span></span>
<span class="line"><span>diag debug en</span></span>
<span class="line"><span>diag debug service sys 255</span></span></code></pre></div><p>To stop debugging:</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>diag debug disable</span></span>
<span class="line"><span>diag debug reset</span></span></code></pre></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("section-12-troubleshooting.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const section12Troubleshooting = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  section12Troubleshooting as default
};
