import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Section 11: Validate Auto Onboarding","description":"","frontmatter":{},"headers":[],"relativePath":"section-10-validate-auto-onboarding.md","filePath":"section-10-validate-auto-onboarding.md","lastUpdated":1789556589000}');
const _sfc_main = { name: "section-10-validate-auto-onboarding.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="section-11-validate-auto-onboarding" tabindex="-1">Section 11: Validate Auto Onboarding <a class="header-anchor" href="#section-11-validate-auto-onboarding" aria-label="Permalink to &quot;Section 11: Validate Auto Onboarding&quot;">​</a></h1><ol><li><p>In FortiManager, go to:</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Device Manager &gt; Device &amp; Groups</span></span></code></pre></div></li><li><p>Confirm the lab ASG and both initial FortiGate instances are visible.</p></li><li><p>Confirm that newly discovered FortiGate devices appear in the correct device group.</p></li><li><p>Confirm license status.</p></li><li><p>Confirm device communication.</p></li></ol><h2 id="checkpoint" tabindex="-1">Checkpoint <a class="header-anchor" href="#checkpoint" aria-label="Permalink to &quot;Checkpoint&quot;">​</a></h2><p>Confirm the following:</p><ul><li>FortiGate devices are visible in FortiManager.</li><li>Devices are placed into the expected ADOM and device group.</li><li>Licensing is assigned successfully.</li><li>FortiManager communication with FortiGate is working.</li><li>The device has the <code>GWLB-Web-Provisioning</code> template and <code>GWLB-Web-Demo</code> package from <a href="./section-10-fortimanager-configuration">Section 10</a>.</li><li>Configuration installation succeeded, including the four demo policies.</li><li>Both initial nodes are healthy GWLB targets. Open the demo URL and select <strong>Start traffic</strong> to observe inspection; flow distribution may be uneven.</li><li>Continue to <a href="./section-11-scale-asg">Section 12</a> to add and validate the third member.</li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("section-10-validate-auto-onboarding.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const section10ValidateAutoOnboarding = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  section10ValidateAutoOnboarding as default
};
