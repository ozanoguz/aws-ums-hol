import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Runtime API Examples","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"api-examples.md","filePath":"api-examples.md","lastUpdated":1781593706000}');
const _sfc_main = { name: "api-examples.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="runtime-api-examples" tabindex="-1">Runtime API Examples <a class="header-anchor" href="#runtime-api-examples" aria-label="Permalink to &quot;Runtime API Examples&quot;">​</a></h1><p>This page demonstrates usage of some of the runtime APIs provided by VitePress.</p><p>The main <code>useData()</code> API can be used to access site, theme, and page data for the current page. It works in both <code>.md</code> and <code>.vue</code> files:</p><div class="language-md vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">md</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">&lt;script setup&gt;</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">import { useData } from &#39;vitepress&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">const { theme, page, frontmatter } = useData()</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">&lt;/script&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-light-font-weight": "bold", "--shiki-dark": "#79B8FF", "--shiki-dark-font-weight": "bold" })}">## Results</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-light-font-weight": "bold", "--shiki-dark": "#79B8FF", "--shiki-dark-font-weight": "bold" })}">### Theme Data</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">&lt;pre&gt;{{ theme }}&lt;/pre&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-light-font-weight": "bold", "--shiki-dark": "#79B8FF", "--shiki-dark-font-weight": "bold" })}">### Page Data</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">&lt;pre&gt;{{ page }}&lt;/pre&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#005CC5", "--shiki-light-font-weight": "bold", "--shiki-dark": "#79B8FF", "--shiki-dark-font-weight": "bold" })}">### Page Frontmatter</span></span>
<span class="line"><span style="${ssrRenderStyle({ "--shiki-light": "#24292E", "--shiki-dark": "#E1E4E8" })}">&lt;pre&gt;{{ frontmatter }}&lt;/pre&gt;</span></span></code></pre></div><h2 id="results" tabindex="-1">Results <a class="header-anchor" href="#results" aria-label="Permalink to &quot;Results&quot;">​</a></h2><h3 id="theme-data" tabindex="-1">Theme Data <a class="header-anchor" href="#theme-data" aria-label="Permalink to &quot;Theme Data&quot;">​</a></h3><pre>${ssrInterpolate(_ctx.theme)}</pre><h3 id="page-data" tabindex="-1">Page Data <a class="header-anchor" href="#page-data" aria-label="Permalink to &quot;Page Data&quot;">​</a></h3><pre>${ssrInterpolate(_ctx.page)}</pre><h3 id="page-frontmatter" tabindex="-1">Page Frontmatter <a class="header-anchor" href="#page-frontmatter" aria-label="Permalink to &quot;Page Frontmatter&quot;">​</a></h3><pre>${ssrInterpolate(_ctx.frontmatter)}</pre><h2 id="more" tabindex="-1">More <a class="header-anchor" href="#more" aria-label="Permalink to &quot;More&quot;">​</a></h2><p>Check out the documentation for the <a href="https://vitepress.dev/reference/runtime-api#usedata" target="_blank" rel="noreferrer">full list of runtime APIs</a>.</p></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("api-examples.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const apiExamples = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  apiExamples as default
};
