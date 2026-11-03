<script lang="ts">
  /* The work: three cards, each a title, a line or two, and a link to
     the code. The detail lives in each project's README.

     Two layouts, same cards:
       row    three columns. Giant numerals sit behind and drift at their
              own speed; each card rises into place with a spring.
       stack  the section pins and the cards stack: each new one slides
              up over the last, which shrinks and dims behind it.

     In both, a card writes itself when it appears (title and text
     arrive piece by piece, then a sweep of attention crosses the
     text once), and tilts toward the pointer with a lime edge light.

     All of it is plain content from the start. Script marks cards as
     "armed" only after it is running, reveals them as they scroll
     into view, and a poll covers observers that never fire. */
  import { onMount } from 'svelte';
  import type { Entry } from '../../lib/brain/types';
  import Marker from './Marker.svelte';

  let { entries, mode = 'row' }: { entries: Entry[]; mode?: 'row' | 'stack' } = $props();

  /** Words a model would barely look at. */
  const STOP = new Set(['a','an','the','in','and','or','of','it','its','to','is','as','with','on','for','at','by','into','but','their','them']);

  interface Word { t: string; w: number }

  /** Splits a blurb into words, each with a weight 0–1: how hard a
   *  reader (or a model) would look at it. Words wrapped in *stars*
   *  in the content are the ones that matter and get full weight;
   *  everything else gets a small, uneven weight, so the attention
   *  map is a graded one rather than two flat colours. */
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

  const pad = (n: number) => String(n).padStart(2, '0');

  let root: HTMLElement;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const clamp = (x: number) => Math.min(1, Math.max(0, x));
    const ease = (t: number) => t * t * (3 - 2 * t);
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-card]'));
    cards.forEach((c) => c.classList.add('armed'));
    root.classList.add('armed');

    const cleanup: Array<() => void> = [];

    /* ---- tilt toward the pointer, with a lime edge light ---- */
    if (matchMedia('(pointer: fine)').matches) {
      cards.forEach((card) => {
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          card.style.setProperty('--ry', `${((x / r.width - 0.5) * 11).toFixed(2)}deg`);
          card.style.setProperty('--rx', `${(-(y / r.height - 0.5) * 9).toFixed(2)}deg`);
          card.style.setProperty('--mx', `${x}px`);
          card.style.setProperty('--my', `${y}px`);
        };
        const leave = () => {
          card.style.setProperty('--ry', '0deg');
          card.style.setProperty('--rx', '0deg');
        };
        card.addEventListener('pointermove', move);
        card.addEventListener('pointerleave', leave);
        cleanup.push(() => {
          card.removeEventListener('pointermove', move);
          card.removeEventListener('pointerleave', leave);
        });
      });
    }

    if (mode === 'row') {
      const slots = Array.from(root.querySelectorAll<HTMLElement>('.slot'));
      const ghosts = slots.map((s) => s.querySelector<HTMLElement>('.ghost')!);
      const revealed = new Set<HTMLElement>();

      const reveal = (slot: HTMLElement) => {
        if (revealed.has(slot)) return;
        revealed.add(slot);
        slot.classList.add('live');
        slot.querySelector('[data-card]')?.classList.add('live');
      };

      const io = new IntersectionObserver(
        (list) => list.forEach((e) => e.isIntersecting && reveal(e.target as HTMLElement)),
        { threshold: 0.25 },
      );
      slots.forEach((s) => io.observe(s));

      // Observers can fail to fire (a background tab, say): check by hand too.
      const poll = setInterval(() => {
        slots.forEach((s) => {
          const r = s.getBoundingClientRect();
          if (r.top < innerHeight * 0.85 && r.bottom > 0) reveal(s);
        });
        if (revealed.size === slots.length) clearInterval(poll);
      }, 500);

      // Giant numerals drift against the scroll, each at its own rate.
      let raf = 0;
      const drift = () => {
        raf = 0;
        slots.forEach((s, i) => {
          const r = s.getBoundingClientRect();
          const dy = r.top + r.height / 2 - innerHeight / 2;
          ghosts[i].style.transform = `translate3d(0, ${(dy * (0.16 + i * 0.09)).toFixed(1)}px, 0)`;
        });
      };
      const schedule = () => {
        if (!raf) raf = requestAnimationFrame(drift);
      };
      drift();
      addEventListener('scroll', schedule, { passive: true });
      addEventListener('resize', schedule, { passive: true });

      cleanup.push(() => {
        io.disconnect();
        clearInterval(poll);
        cancelAnimationFrame(raf);
        removeEventListener('scroll', schedule);
        removeEventListener('resize', schedule);
      });
    } else {
      /* ---- stack: the section pins, cards slide up over each other ---- */
      const wrap = root.querySelector<HTMLElement>('.stackwrap')!;
      const sheets = Array.from(root.querySelectorAll<HTMLElement>('.sheet'));
      wrap.classList.add('pinned');
      const n = sheets.length;
      let raf = 0;

      const paint = () => {
        raf = 0;
        const r = wrap.getBoundingClientRect();
        const p = clamp(-r.top / (r.height - innerHeight));
        // How far along each card's arrival is. Card 0 is already there.
        const u = sheets.map((_, i) => (i === 0 ? 1 : clamp(p * (n - 1) - (i - 1))));

        sheets.forEach((sheet, i) => {
          // How many later cards have covered this one, fractionally.
          let covered = 0;
          for (let j = i + 1; j < n; j++) covered += ease(u[j]);
          const rise = (1 - ease(u[i])) * innerHeight * 0.85;
          sheet.style.transform = `translate3d(0, ${(rise - covered * 20).toFixed(1)}px, 0) scale(${(1 - covered * 0.05).toFixed(4)})`;
          sheet.style.filter = covered > 0 ? `brightness(${(1 - covered * 0.4).toFixed(3)})` : '';
          const card = sheet.querySelector('[data-card]');
          const shown = i === 0 ? r.top < innerHeight * 0.5 : u[i] > 0.35;
          if (shown) card?.classList.add('live');
        });
      };
      const schedule = () => {
        if (!raf) raf = requestAnimationFrame(paint);
      };
      paint();
      addEventListener('scroll', schedule, { passive: true });
      addEventListener('resize', schedule, { passive: true });
      cleanup.push(() => {
        cancelAnimationFrame(raf);
        removeEventListener('scroll', schedule);
        removeEventListener('resize', schedule);
        wrap.classList.remove('pinned');
      });
    }

    return () => cleanup.forEach((fn) => fn());
  });
</script>

{#snippet card(entry: Entry, i: number)}
  {@const title = (entry.tagline ?? entry.short).split(/(\s+)/).filter(Boolean)}
  {@const words = weigh(entry.blurb ?? entry.plain ?? '')}
  <div
    class="card glass"
    data-card
    style={`--base:${mode === 'row' ? i * 160 + 300 : 150}ms; --n:${title.length + words.length}`}
  >
    <div class="top">
      <span class="num" aria-hidden="true">{pad(i + 1)}</span>
      <span class="hint" aria-hidden="true">attention</span>
    </div>
    <h3>
      {#each title as t, k (k)}<span class="gen" style={`--k:${k}`}>{t}</span>{/each}
    </h3>
    <p>
      {#each words as word, k (k)}<span
          class="w gen"
          style={`--w:${word.w}; --k:${title.length + k}`}>{word.t}</span
        >{/each}
    </p>
    {#if entry.link}
      <a href={entry.link} rel="noreferrer noopener">
        How it's built <span aria-hidden="true">↗</span>
      </a>
    {/if}
  </div>
{/snippet}

<div class="work" bind:this={root} style={`--count:${entries.length}`}>
  {#if mode === 'row'}
    <div class="page">
      <p class="label">Things I've built</p>
      <h2>AI works in the demo. Then <Marker>real people use it.</Marker></h2>
      <p class="sub">Three things I built for the second part.</p>

      <ol class="deck">
        {#each entries as entry, i (entry.id)}
          <li class="slot" style={`--rd:${i * 160}ms`}>
            <span class="ghost" aria-hidden="true">{pad(i + 1)}</span>
            {@render card(entry, i)}
          </li>
        {/each}
      </ol>
    </div>
  {:else}
    <div class="stackwrap">
      <div class="stickyst">
        <div class="page">
          <p class="label">Things I've built</p>
          <h2>AI works in the demo. Then <Marker>real people use it.</Marker></h2>
        </div>
        <div class="page">
          <ol class="pile">
            {#each entries as entry, i (entry.id)}
              <li class="sheet" style={`z-index:${i + 1}`}>{@render card(entry, i)}</li>
            {/each}
          </ol>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2rem, 4vw + 1rem, 4.5rem);
    font-variation-settings: 'wght' 560;
    line-height: 1;
    letter-spacing: -0.035em;
    max-width: 17ch;
  }

  .sub { margin-top: var(--s-4); font-size: var(--t-lg); color: var(--ink-soft); }

  .deck {
    list-style: none;
    margin: var(--s-8) 0 0;
    padding: 0;
    display: grid;
    gap: var(--s-7);
    perspective: 1100px;
  }

  .slot { position: relative; display: grid; }

  /* The giant numeral behind each card. */
  .ghost {
    position: absolute;
    left: -0.04em;
    top: -0.62em;
    z-index: 0;
    font-family: var(--font-display);
    font-size: clamp(7rem, 15vw, 14rem);
    font-weight: 700;
    font-variation-settings: 'wght' 700;
    line-height: 1;
    letter-spacing: -0.05em;
    color: transparent;
    -webkit-text-stroke: 1.5px color-mix(in oklab, var(--ink) 20%, transparent);
    pointer-events: none;
    will-change: transform;
  }

  .card {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    padding: var(--s-6);
    border: 1.5px solid var(--glass-border);
    border-radius: var(--glass-radius);
    box-shadow: var(--shadow-hard);
    transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))
      translate(var(--tx, 0px), var(--ty, 0px));
    transition: transform 160ms ease-out, box-shadow 420ms var(--ease-out);
    will-change: transform;
  }

  .card:hover {
    --tx: -3px;
    --ty: -3px;
    box-shadow: var(--card-hover);
  }

  /* A lime edge light that follows the pointer around the border. */
  .card::after {
    content: '';
    position: absolute;
    inset: -1.5px;
    border-radius: inherit;
    padding: 1.5px;
    background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), #d7ff3a, transparent 62%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 280ms var(--ease);
    pointer-events: none;
  }

  .card:hover::after { opacity: 1; }

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

  .card:hover .hint { opacity: 1; }

  .num {
    font-family: var(--font-label);
    font-size: var(--t-lg);
    color: var(--ink);
  }

  h3 {
    font-size: var(--t-xl);
    font-variation-settings: 'wght' 560;
    line-height: 1.12;
    letter-spacing: -0.02em;
  }

  .card p { color: var(--ink-soft); font-size: var(--t-base); max-width: 32ch; }

  .w {
    border-radius: 2px;
    padding-block: 0.04em;
    transition: background-color 420ms var(--ease) calc(var(--k) * 12ms);
  }

  /* Hover: the same attention map, held. */
  .card:hover .w {
    background-color: color-mix(in oklab, var(--card-accent) calc(var(--w) * 42%), transparent);
  }

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

  @media (hover: none) {
    .w { background-color: color-mix(in oklab, var(--card-accent) calc(var(--w) * 30%), transparent); }
    .hint { opacity: 1; }
  }

  /* ---------- the entrance ---------- */

  /* Row: each slot rises with a spring. */
  .slot:global(.armed):not(:global(.live)) { opacity: 0; transform: translateY(80px); }
  :global(.armed) .slot { will-change: transform, opacity; }
  .slot:global(.live) { animation: rise 1000ms cubic-bezier(0.3, 1.35, 0.4, 1) var(--rd) backwards; }

  @keyframes rise {
    from { opacity: 0; transform: translateY(80px); }
    to   { opacity: 1; transform: none; }
  }

  /* The card writes itself: title and text arrive piece by piece... */
  .card:global(.armed):not(:global(.live)) .gen { opacity: 0; }

  .card:global(.live) .gen {
    animation:
      gen-in 1ms linear backwards,
      gen-lit 800ms ease-out;
    animation-delay: calc(var(--base) + var(--k) * 42ms), calc(var(--base) + var(--k) * 42ms);
  }

  /* ...then a sweep of attention crosses the text, once. */
  .card:global(.live) .w {
    animation:
      gen-in 1ms linear backwards,
      gen-lit 800ms ease-out,
      heat 1500ms ease-in-out;
    animation-delay:
      calc(var(--base) + var(--k) * 42ms),
      calc(var(--base) + var(--k) * 42ms),
      calc(var(--base) + var(--n) * 42ms + 350ms + var(--k) * 34ms);
  }

  @keyframes gen-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes gen-lit {
    from { background-color: color-mix(in oklab, var(--card-accent) 55%, transparent); }
    to   { background-color: transparent; }
  }

  @keyframes heat {
    0%   { background-color: transparent; }
    40%  { background-color: color-mix(in oklab, var(--card-accent) calc(var(--w) * 42%), transparent); }
    100% { background-color: transparent; }
  }

  /* ---------- stack layout ---------- */

  .pile { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-6); }

  .stackwrap:global(.pinned) { height: calc(100svh * (var(--count) + 0.8)); }

  .stackwrap:global(.pinned) .stickyst {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
    display: grid;
    align-content: center;
    gap: var(--s-6);
  }

  .stackwrap:global(.pinned) h2 { font-size: clamp(1.75rem, 3vw + 0.8rem, 3.4rem); }

  .stackwrap:global(.pinned) .pile {
    display: block;
    position: relative;
    height: min(54vh, 26rem);
  }

  .stackwrap:global(.pinned) .sheet {
    position: absolute;
    inset: 0;
    will-change: transform, filter;
    transform-origin: 50% 100%;
  }

  .stackwrap:global(.pinned) .sheet .card { height: 100%; padding: var(--s-6) var(--s-7); }
  .stackwrap:global(.pinned) .sheet h3 { font-size: clamp(1.6rem, 2.6vw + 0.6rem, 2.6rem); }
  .stackwrap:global(.pinned) .sheet .card p { font-size: var(--t-lg); max-width: 38ch; }

  @media (width >= 60rem) {
    .deck { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-6); }
    .slot:nth-child(2) { margin-top: var(--s-7); }
  }

  @media (prefers-reduced-motion: reduce) {
    .card, .card:hover { transform: none; transition: none; }
    .ghost { transform: none !important; }
  }
</style>
