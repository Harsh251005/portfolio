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
  // Point this at the real domain once it is bought. Canonical URLs,
  // sitemap and social tags all read from here and nowhere else.
  site: 'https://example.com',
  integrations: [svelte(), sitemap()],
  markdown: {
    // remarkMore turns `:::more[label]` blocks into collapsed <details>,
    // so a plain-English answer always comes before the technical one.
    processor: unified({
      remarkPlugins: [remarkDirective, remarkMore, remarkPlaceholder],
    }),
  },
  build: { inlineStylesheets: 'auto' },
});