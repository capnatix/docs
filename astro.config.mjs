// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// docs.capnatix.com is a custom domain served at the root — no `base`.
export default defineConfig({
  site: 'https://docs.capnatix.com',
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
      sidebar: [
        { label: 'API Explorer', link: '/api/' },
        { label: 'Releases & downloads', link: '/releases/' },
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
      ],
    }),
  ],
});
