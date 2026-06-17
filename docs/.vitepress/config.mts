import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AWS UMS HOL',
  description: 'Deploy and Configure FortiManager UMS on AWS',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#2e7cf6' }]
  ],

  themeConfig: {
    siteTitle: 'AWS UMS HOL',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Lab Guide', link: '/introduction' }
    ],

    sidebar: [
      {
        text: 'Lab Guide',
        collapsed: false,
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Section 1: Log in to AWS', link: '/section-1-aws-login' },
          { text: 'Section 2: Deploy FortiManager', link: '/section-2-deploy-fortimanager' },
          { text: 'Section 3: API Administrator', link: '/section-3-api-admin' },
          { text: 'Section 4: AWS Cloud SDN Connector', link: '/section-4-aws-sdn-connector' },
          { text: 'Section 5: Enable SDN Connector for UMS', link: '/section-5-enable-ums' },
          { text: 'Section 6: FortiFlex Connector', link: '/section-6-fortiflex-connector' },
          { text: 'Section 7: Auto Onboarding Rule', link: '/section-7-auto-onboarding' },
          { text: 'Section 8: Deploying Cloud9 Instance', link: '/section-8-deploy-cloud9' },
          { text: 'Section 9: Terraform Auto Scaling Group', link: '/section-9-terraform-asg' },
          { text: 'Section 10: Validate Auto Onboarding', link: '/section-10-validate-auto-onboarding' },
          { text: 'Section 11: Scale Auto Scaling Group', link: '/section-11-scale-asg' },
          { text: 'Section 12: Troubleshooting', link: '/section-12-troubleshooting' },
          { text: 'References', link: '/references' }
        ]
      }
    ],

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: 'On this page'
    },

    docFooter: {
      prev: 'Previous',
      next: 'Next'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ozanoguz/aws-ums-hol' }
    ],

    footer: {
      message: 'AWS UMS Hands-on Lab Guide',
      copyright: 'Copyright © 2026'
    }
  }
})
