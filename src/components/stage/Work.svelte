<script lang="ts">
  /* The work: three cards, each a title, a line or two, and a link to
     the code. The detail lives in each project's README.

     Each card is uncovered by a scanner line as it scrolls into view
     (see Scan.svelte). */
  import type { Entry } from '../../lib/brain/types';
  import Marker from './Marker.svelte';
  import Scan from './Scan.svelte';

  let { entries }: { entries: Entry[] } = $props();

  /** Words a model would barely look at. */
  const STOP = new Set(['a','an','the','in','and','or','of','it','its','to','is','as','with','on','for','at','by','into','but','their','them']);

  interface Word { t: string; w: number }

  /** Splits a blurb into words, each with a weight 0–1: how hard a
   *  reader (or a model) would look at it. Words wrapped in *stars*
   *  in the content are the ones that matter and get full weight;
   *  everything else gets a small, uneven weight, so hovering shows a
   *  graded map rather than two flat colours. */
  function weigh(blurb: string): Word[] {
    const out: Word[] = [];
    let n = 0;
    for (const part of blurb.split(/(\*[^*]+\*)/)) {
      const strong = part.startsWith('*');
      const text = strong ? part.slice(1, -1) : part;
      for (const piece of text.split(/(\s+)/)) {
        if (!piece) continue;
        if (/^\s+$/.test(piece)) {
          out.push({ t: piece, w: 0 });
          continue;
        }
        const bare = piece.replace(/[^\w']/g, '').toLowerCase();
        const base = STOP.has(bare) ? 0.04 : 0.12 + (((n * 37) % 7) / 7) * 0.2;
        out.push({ t: piece, w: strong ? 1 : base });
        n++;
      }
    }
    return out;
  }

</script>

<div class="page work">
  <Scan>
    <p class="label">Things I've built</p>
    <h2>AI works in the demo. Then <Marker>real people use it.</Marker></h2>
    <p class="sub">Three things I built for the second part.</p>
  </Scan>

  <ol class="deck">
    {#each entries as entry, i (entry.id)}
      <li class="slot">
        <Scan delay={i * 180} class="fill">
          <div class="card glass">
            <div class="top">
              <span class="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span class="hint" aria-hidden="true">attention</span>
            </div>
            <h3>{entry.tagline ?? entry.short}</h3>
            <p>
              {#each weigh(entry.blurb ?? entry.plain ?? '') as word, k (k)}<span
                  class="w"
                  style={`--w:${word.w}; --k:${k}`}>{word.t}</span
                >{/each}
            </p>
            {#if entry.link}
              <a href={entry.link} rel="noreferrer noopener">
                How it's built <span aria-hidden="true">↗</span>
              </a>
            {/if}
          </div>
        </Scan>
      </li>
    {/each}
  </ol>
</div>

<style>
  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2rem, 4vw + 1rem, 4.5rem);
    font-variation-settings: 'opsz' 72, 'wght' 440, 'WONK' 1;
    line-height: 1;
    letter-spacing: -0.03em;
    max-width: 17ch;
  }

  .sub { margin-top: var(--s-4); font-size: var(--t-lg); color: var(--ink-soft); }

  .deck {
    list-style: none;
    margin: var(--s-8) 0 0;
    padding: 0;
    display: grid;
    gap: var(--s-7);
  }

  .slot { display: grid; }
  .slot :global(.fill) { height: 100%; }

  .card {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    padding: var(--s-6);
    background: var(--card-bg);
    border: 1.5px solid var(--glass-border);
    border-radius: var(--glass-radius);
    box-shadow: var(--shadow-hard);
    transition: transform 420ms var(--ease-out), box-shadow 420ms var(--ease-out);
  }

  .card:hover {
    transform: translate(-3px, -3px);
    box-shadow: var(--card-hover);
  }

  .top { display: flex; justify-content: space-between; align-items: baseline; }

  .hint {
    font-family: var(--font-label);
    font-size: var(--t-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-faint);
    opacity: 0;
    transition: opacity 320ms var(--ease);
  }

  /* What a model's attention might look like over this sentence:
     each word lights in proportion to its weight, sweeping left to
     right. Hover or keyboard focus shows it; on a touch screen,
     where there is no hover, it is shown at rest. */
  .w {
    border-radius: 2px;
    padding-block: 0.04em;
    transition: background-color 420ms var(--ease) calc(var(--k) * 24ms);
  }

  .card:hover .w,
  .card:focus-within .w {
    background-color: color-mix(in oklab, var(--card-accent) calc(var(--w) * 42%), transparent);
  }

  .card:hover .hint,
  .card:focus-within .hint { opacity: 1; }

  @media (hover: none) {
    .w { background-color: color-mix(in oklab, var(--card-accent) calc(var(--w) * 30%), transparent); }
    .hint { opacity: 1; }
  }

  .num {
    font-family: var(--font-label);
    font-size: var(--t-lg);
    font-variation-settings: 'opsz' 72, 'wght' 300;
    line-height: 1;
    color: var(--ink);
  }

  h3 {
    font-size: var(--t-xl);
    font-variation-settings: 'opsz' 36, 'wght' 480;
    line-height: 1.12;
    letter-spacing: -0.015em;
  }

  .card p { color: var(--ink-soft); font-size: var(--t-base); max-width: 32ch; }

  .card a {
    margin-top: auto;
    padding-top: var(--s-3);
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    min-height: var(--tap);
    font-variation-settings: 'wght' 600;
    font-size: var(--t-sm);
    color: var(--ink);
    text-decoration-thickness: 2px;
    text-decoration-color: var(--accent);
    text-underline-offset: 0.3em;
  }

  .card a:hover { color: var(--accent); }

  @media (width >= 60rem) {
    .deck { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-6); }
    .slot:nth-child(2) { margin-top: var(--s-7); }
  }

  @media (prefers-reduced-motion: reduce) {
    .card, .card:hover { transform: none; transition: none; }
  }
</style>
