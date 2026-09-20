import type { APIRoute } from 'astro';

/* robots.txt is generated rather than kept as a static file, so the
   domain lives in exactly one place: `site` in astro.config.mjs.
   A static copy would be a second place to forget. */
export const GET: APIRoute = ({ site }) => {
  const host = site ?? new URL('https://example.com');

  return new Response(
    `User-agent: *
Allow: /

# The share-card surface is a rendering target, not a page.
Disallow: /og-card

Sitemap: ${new URL('sitemap-index.xml', host).href}
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
