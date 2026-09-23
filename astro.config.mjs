// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// docs.capnatix.com is a custom domain served at the root — no `base`.
export default defineConfig({
  site: 'https://docs.capnatix.com',
  // Skips the old marketing-style splash landing page -- straight into the
  // docs tree instead, matching the Docs/API tabbed shell.
  redirects: {
    '/': '/getting-started/installation/',
  },
  integrations: [
    starlight({
      title: 'Capnatix Docs',
      logo: {
        light: './src/assets/logo-light.png',
        dark: './src/assets/logo-dark.png',
        alt: 'Capnatix',
        replacesTitle: true,
      },
      customCss: ['./src/styles/capnatix.css'],
      components: {
        // Adds a top-nav Docs/API tab switcher, right after the site title —
        // see src/components/Header.astro's own header comment.
        Header: './src/components/Header.astro',
        // Adds the API Docs version picker inline with the page title, on
        // /api only — see src/components/PageTitle.astro's own comment.
        PageTitle: './src/components/PageTitle.astro',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', link: '/getting-started/installation/' },
            { label: 'Configuration', link: '/getting-started/configuration/' },
          ],
        },
        { label: 'Releases', link: '/releases/' },
        {
          label: 'Guide',
          items: [
            {
              label: 'Instance Configuration',
              items: [
                { label: 'License Setup', link: '/guide/instance-configuration/license-setup/' },
                { label: 'Fund Setup', link: '/guide/instance-configuration/fund-setup/' },
                { label: 'Branding', link: '/guide/instance-configuration/branding/' },
                { label: 'SMTP', link: '/guide/instance-configuration/smtp/' },
                {
                  label: 'Single Sign On',
                  link: '/guide/instance-configuration/single-sign-on/',
                },
              ],
            },
            {
              label: 'Global Setting',
              items: [
                { label: 'Date/Time', link: '/guide/global-setting/date-time/' },
                { label: 'Managed List', link: '/guide/global-setting/managed-list/' },
                { label: 'Email Templates', link: '/guide/global-setting/email-templates/' },
                { label: 'Custom Fields', link: '/guide/global-setting/custom-fields/' },
                { label: 'IC Members', link: '/guide/global-setting/ic-members/' },
                { label: 'Trash', link: '/guide/global-setting/trash/' },
              ],
            },
            {
              label: 'User Management',
              items: [
                {
                  label: 'Master',
                  items: [
                    { label: 'Fund Roles', link: '/guide/user-management/master/roles/' },
                    { label: 'Users', link: '/guide/user-management/master/users/' },
                  ],
                },
                {
                  label: 'Fund',
                  items: [
                    {
                      label: 'User Role Mapping',
                      link: '/guide/user-management/fund/user-role-mapping/',
                    },
                  ],
                },
              ],
            },
            {
              label: 'Fund Operations',
              items: [
                { label: 'Inbox', link: '/guide/fund-operations/inbox/' },
                {
                  label: 'Deal Sourcing',
                  link: '/guide/fund-operations/deal-sourcing/',
                },
                { label: 'Portfolio', link: '/guide/fund-operations/portfolio/' },
                { label: 'IC Meetings', link: '/guide/fund-operations/ic-meetings/' },
                {
                  label: 'Investor Management',
                  link: '/guide/fund-operations/investor-management/',
                },
                { label: 'Reports', link: '/guide/fund-operations/reports/' },
              ],
            },
            {
              label: 'Fund Configuration',
              items: [
                { label: 'Fund Stages', link: '/guide/fund-configuration/fund-stages/' },
                { label: 'Deal Cards', link: '/guide/fund-configuration/deal-cards/' },
                { label: 'Application Form', link: '/guide/fund-configuration/application-form/' },
              ],
            },
          ],
        },
        { label: 'Chrome Extension', link: '/chrome-extension/' },
        { label: 'FAQs', link: '/faqs/' },
        { label: 'Support', link: '/support/' },
      ],
      head: [
        // Starlight's own `favicon` option only emits the /favicon.svg link
        // tag. The .ico fallback and apple-touch-icon existed before this
        // migration and must survive it — added explicitly here since
        // Starlight's head config in astro.config.mjs is global (every page,
        // including src/pages/releases.astro, renders through the same
        // Starlight <Head> component), not just for content-collection pages.
        {
          tag: 'link',
          attrs: { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        },
        {
          tag: 'link',
          attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        },
        // Arrow-key navigation for search results -- @pagefind/default-ui
        // (the widget Starlight's own Search.astro wires up unmodified)
        // has none built in. Global, not page-scoped, since search opens
        // from every page's header. See the script's own header comment
        // for why this is a small separate file rather than a fork of
        // Search.astro.
        {
          tag: 'script',
          attrs: { src: '/assets/search-keynav.js', defer: true },
        },
      ],
    }),
  ],
});
