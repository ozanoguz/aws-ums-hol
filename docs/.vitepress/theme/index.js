import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-before': () =>
        h('div', { class: 'xperts-banner' }, [
          h('img', {
            src: '/images/xperts.png',
            alt: 'Fortinet EMEA XPERTS26 Madrid'
          })
        ])
    })
  }
}
