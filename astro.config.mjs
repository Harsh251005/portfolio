// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import svelte from '@astrojs/svelte';
import remarkDirective from 'remark-directive';
import { remarkMore } from './src/lib/markdown/remark-more.js';
import { remarkPlaceholder } from './src/lib/markdown/remark-placeholder.js';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // ────────────────────────────────────────────────────────────────
  //  THE ONE LINE TO CHANGE BEFORE DEPLOYING.
  //  Canonical URLs, the sitemap, robots.txt and the social share
  //  tags all read the domain from here and from nowhere else.
  // ────────────────────────────────────────────────────────────────
  site: 'https://example.com',
  integrations: [
    svelte(),
    // og-card is a rendering surface for the share image, not a page.
    sitemap({ filter: (page) => !page.includes('/og-card') }),
  ],
  markdown: {
    // remarkMore turns `:::more[label]` blocks into collapsed <details>,
    // so a plain-English answer always comes before the technical one.
    processor: unified({
      remarkPlugins: [remarkDirective, remarkMore, remarkPlaceholder],
    }),
  },
  build: { inlineStylesheets: 'auto' },
});