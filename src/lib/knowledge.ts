import { getCollection } from 'astro:content';
import { GROUPS, GROUP_LABELS } from '../content.config';
import type { Entry } from './brain/types';

/* ---------------------------------------------------------------
   Loads the knowledge collection and flattens it into plain Entry
   objects that are safe to send to the browser.

   Everything that displays knowledge goes through here: the Thread,
   the Map, /everything, /ask/[slug]. None of them read the
   collection directly, so the shape can change in one place.
   --------------------------------------------------------------- */

export { GROUPS, GROUP_LABELS };

/** Strip tags and entities so the matcher scores words, not markup. */
function toText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

let cache: Entry[] | null = null;

export async function loadEntries(): Promise<Entry[]> {
  if (cache) return cache;

  const raw = await getCollection('knowledge');

  const entries = await Promise.all(
    raw.map(async (item): Promise<Entry> => {
      // Astro renders each body once at build time and stores the
      // HTML on the entry. Keeping the string means the browser
      // island needs no further fetching and works offline.
      const html = item.rendered?.html ?? '';

      return {
        id: item.id,
        question: item.data.question,
        short: item.data.short,
        aliases: item.data.aliases,
        group: item.data.group,
        card: item.data.card,
        featured: item.data.featured,
        order: item.data.order,
        followups: item.data.followups,
        hidden: item.data.hidden,
        html,
        text: toText(html),
        tagline: item.data.tagline,
        plain: item.data.plain,
        link: item.data.link,
        items: item.data.items,
        sides: item.data.sides,
        attribution: item.data.attribution,
      };
    }),
  );

  cache = entries.sort(
    (a, b) =>
      GROUPS.indexOf(a.group as never) - GROUPS.indexOf(b.group as never) ||
      a.order - b.order,
  );
  return cache;
}

export async function loadEntry(id: string): Promise<Entry | undefined> {
  return (await loadEntries()).find((e) => e.id === id);
}

/** Entries shown as chips on the landing page. */
export async function loadFeatured(): Promise<Entry[]> {
  return (await loadEntries()).filter((e) => e.featured && !e.hidden);
}

/** Grouped for the Map panel and /everything, in display order. */
export async function loadGrouped() {
  const entries = (await loadEntries()).filter((e) => !e.hidden);
  return GROUPS.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    entries: entries.filter((e) => e.group === group),
  })).filter((g) => g.entries.length > 0);
}
