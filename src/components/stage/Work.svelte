<script lang="ts">
  /* The work: three cards, each a title, a line or two, and a link to
     the code. The detail lives in each project's README.

     The cards start as one face-down dark deck. Scrolling opens it: on
     a wide screen the section holds still while the cards lift, turn
     over into the light and settle into three columns, one after
     another. On a narrow or short screen there is no hold, and each
     card turns over by itself as it comes up the page.

     All of it follows the scroll, forwards and back, through a damped
     value so it has weight instead of copying each wheel tick. As a
     card's face comes up, a band of light crosses it and its words come
     into focus; then a sweep of attention crosses the text once, and the
     words that matter stay marked.

     All of it is plain content from the start: a flat row of cards.
     Script takes that away only once it is running, and with reduced
     motion it never does. */
  import { onMount } from 'svelte';
  import type { Entry } from '../../lib/brain/types';
  import Marker from './Marker.svelte';

  let { entries }: { entries: Entry[] } = $props();

  /** Words a model would barely look at. */
  const STOP = new Set(['a','an','the','in','and','or','of','it','its','to','is','as','with','on','for','at','by','into','but','their','them']);

  interface Word { t: string; w: number; strong: boolean }

  /** Splits a blurb into words, each with a weight 0–1: how hard a
   *  reader (or a model) would look at it. Words wrapped in *stars*
   *  in the content are the ones that matter and get full weight;
   *  everything else gets a small, uneven weight, so the attention
   *  map is a graded one rather than two flat colours. */
  function weigh(blurb: string): Word[] {
    const out: Word[] = [];
    let n = 0;
    let spaced = true;
    for (const part of blurb.split(/(\*[^*]+\*)/)) {
      const strong = part.startsWith('*');
      const text = strong ? part.slice(1, -1) : part;
      for (const piece of text.split(/(\s+)/)) {
        if (!piece) continue;
        if (/^\s+$/.test(piece)) {
          spaced = true;
          continue;
        }
        // Punctuation right after a starred phrase belongs to its last word.
        if (!spaced && out.length) {
          out[out.length - 1].t += piece;
          continue;
        }
        spaced = false;
        const bare = piece.replace(/[^\w']/g, '').toLowerCase();
        const base = STOP.has(bare) ? 0.04 : 0.12 + (((n * 37) % 7) / 7) * 0.2;
        out.push({ t: piece, w: strong ? 1 : base, strong });
        n++;
      }
    }
    return out;
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  /** Scroll positions, as fractions of the hold, for the deck's timeline. */
  const FIRST = 0.06;
  const GAP = 0.2;
  const SPAN = 0.46;

  /** How long the motion takes to catch up with the scroll, in ms. */
  const LAG = 110;

  let root: HTMLElement;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const clamp = (x: number) => Math.min(1, Math.max(0, x));
    const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

    const deck = root.querySelector<HTMLElement>('.deck')!;
    const page = root.querySelector<HTMLElement>('.page')!;
    const slots = Array.from(root.querySelectorAll<HTMLElement>('.slot'));
    const flips = slots.map((s) => s.querySelector<HTMLElement>('.flip')!);
    const cards = slots.map((s) => s.querySelector<HTMLElement>('[data-card]')!);
    const n = slots.length;

    root.classList.add('armed');

    const target = slots.map(() => 0);
    const current = slots.map(() => -1);
    const forced = slots.map(() => false);
    let toCentre: Array<{ x: number; y: number }> = [];
    let pinned = false;

    /* ---- which layout fits, and how far each card travels ---- */
    const layout = () => {
      root.classList.add('pinned');
      pinned = innerWidth >= 960 && page.offsetHeight <= innerHeight - 16;
      root.classList.toggle('pinned', pinned);
      // While held, the deck sits centred in a full screen. Pull the section's
      // edges in by that spare space so the gap to the sections around it
      // matches every other gap on the page.
      root.style.setProperty('--slack', pinned ? `${Math.max(0, (innerHeight - page.offsetHeight) / 2)}px` : '0px');

      const midX = deck.offsetWidth / 2;
      const midY = deck.offsetHeight / 2;
      toCentre = slots.map((s) => ({
        x: midX - (s.offsetLeft + s.offsetWidth / 2),
        y: midY - (s.offsetTop + s.offsetHeight / 2),
      }));
      slots.forEach((s, i) => (s.style.zIndex = pinned ? String(n - i) : ''));
    };

    /* ---- what the scroll asks for ---- */
    const measure = () => {
      const r = root.getBoundingClientRect();
      const p = pinned ? clamp(-r.top / (r.height - innerHeight)) : 0;
      slots.forEach((s, i) => {
        if (forced[i]) {
          target[i] = 1;
        } else if (pinned) {
          target[i] = clamp((p - (FIRST + i * GAP)) / SPAN);
        } else {
          const top = s.getBoundingClientRect().top;
          target[i] = clamp((innerHeight * 0.96 - top) / (innerHeight * 0.55));
        }
      });
    };

    /* ---- one card, at one point along its turn ---- */
    const paint = (i: number) => {
      const u = ease(current[i]);
      const flip = flips[i];

      if (u >= 0.999) {
        flip.style.transform = '';
      } else {
        const k = 1 - u;
        const arc = Math.sin(Math.PI * u);
        const spread = i - (n - 1) / 2;
        if (pinned) {
          const x = (toCentre[i].x + spread * 18) * k;
          const y = (toCentre[i].y + Math.abs(spread) * 8) * k - arc * 12;
          const turn = (spread > 0 ? -180 : 180) * k;
          flip.style.transform =
            `perspective(2000px) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${(arc * 60).toFixed(1)}px) ` +
            `rotateZ(${(spread * 5 * k).toFixed(2)}deg) rotateY(${turn.toFixed(2)}deg)`;
        } else {
          flip.style.transform =
            `perspective(1100px) translate3d(0, ${(k * 70 - arc * 16).toFixed(1)}px, ${(arc * 80).toFixed(1)}px) ` +
            `rotateY(${(180 * k).toFixed(2)}deg)`;
        }
      }

      // The band of light crosses while the face comes up.
      flip.style.setProperty('--sh', `${(clamp((u - 0.5) * 2) * 120 - 60).toFixed(1)}%`);
      if (u > 0.55) cards[i].classList.add('live');
    };

    /* ---- the damped follow; it sleeps once everything has settled ---- */
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const pull = 1 - Math.exp(-dt / LAG);
      let moving = false;
      for (let i = 0; i < n; i++) {
        const gap = target[i] - current[i];
        if (gap === 0) continue;
        current[i] = Math.abs(gap) < 0.0006 ? target[i] : current[i] + gap * pull;
        paint(i);
        if (current[i] !== target[i]) moving = true;
      }
      if (moving) raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const wake = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /** Jump straight to where the scroll says, with no catching up. */
    const settle = () => {
      layout();
      measure();
      for (let i = 0; i < n; i++) {
        current[i] = target[i];
        paint(i);
      }
    };

    settle();
    document.fonts?.ready.then(settle);

    addEventListener('scroll', wake, { passive: true });
    addEventListener('resize', settle, { passive: true });
    document.addEventListener('visibilitychange', wake);

    // Tabbing to a link on a face-down card has to turn that card over.
    const focus = (e: FocusEvent) => {
      const i = slots.findIndex((s) => s.contains(e.target as Node));
      if (i >= 0) {
        forced[i] = true;
        wake();
      }
    };
    root.addEventListener('focusin', focus);

    /* ---- the whole card opens its page ---- */
    const cleanup: Array<() => void> = [];
    // The card lifts and tilts away from the pointer on hover, so a press can
    // go down on its link and come up on the wrapper beside it. The browser
    // then fires the click on the wrapper, not on the link, so follow the
    // card's link from here.
    slots.forEach((slot, i) => {
      const open = (e: MouseEvent) => {
        if ((e.target as Element).closest('a') || getSelection()?.toString()) return;
        cards[i].querySelector<HTMLAnchorElement>('a')?.click();
      };
      // The card that was clicked grows into the top of its page: it takes the
      // name that the page's header carries, just before the page changes.
      const name = () => cards[i].style.setProperty('view-transition-name', `proj-${entries[i].id}`);
      slot.addEventListener('click', name, true);
      slot.addEventListener('click', open);
      cleanup.push(() => {
        slot.removeEventListener('click', name, true);
        slot.removeEventListener('click', open);
      });
    });

    /* ---- tilt toward the pointer, with a moonlit edge ---- */
    if (matchMedia('(pointer: fine)').matches) {
      // Listen on the fixed slot, not the card: the card tilts and lifts
      // away from the pointer, and hovering it directly made hover (and
      // everything tied to it) switch on and off at the edges.
      slots.forEach((slot, i) => {
        const card = cards[i];
        const move = (e: PointerEvent) => {
          const r = slot.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          card.style.setProperty('--ry', `${((x / r.width - 0.5) * 9).toFixed(2)}deg`);
          card.style.setProperty('--rx', `${(-(y / r.height - 0.5) * 7).toFixed(2)}deg`);
          card.style.setProperty('--mx', `${x}px`);
          card.style.setProperty('--my', `${y}px`);
        };
        const leave = () => {
          card.style.setProperty('--ry', '0deg');
          card.style.setProperty('--rx', '0deg');
        };
        slot.addEventListener('pointermove', move);
        slot.addEventListener('pointerleave', leave);
        cleanup.push(() => {
          slot.removeEventListener('pointermove', move);
          slot.removeEventListener('pointerleave', leave);
        });
      });
    }

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', wake);
      removeEventListener('resize', settle);
      document.removeEventListener('visibilitychange', wake);
      root.removeEventListener('focusin', focus);
      cleanup.forEach((fn) => fn());
    };
  });
</script>

<div class="work" bind:this={root}>
  <div class="stage">
    <div class="page">
      <p class="label">Things I've built</p>
      <h2>AI works in the demo. Then <Marker>real people use it.</Marker></h2>
      <p class="sub">Three things I built for the second part.</p>

      <ol class="deck">
        {#each entries as entry, i (entry.id)}
          {@const title = (entry.tagline ?? entry.short).split(/\s+/).filter(Boolean)}
          {@const words = weigh(entry.blurb ?? entry.plain ?? '')}
          <li class="slot">
            <div class="flip">
              <div class="back" aria-hidden="true">
                <span class="back-num">{pad(i + 1)}</span>
              </div>

              <div class="card glass" data-card style={`--n:${title.length + words.length}`}>
                <div class="top">
                  <span class="num" aria-hidden="true">{pad(i + 1)}</span>
                  <span class="hint" aria-hidden="true">attention</span>
                </div>
                <h3>
                  {#each title as t, k (k)}<span class="gen" style={`--k:${k}`}>{t}</span>{' '}{/each}
                </h3>
                <p>
                  {#each words as word, k (k)}<span
                      class="w gen"
                      style={`--w:${word.w}; --rest:${word.strong ? 1 : 0}; --k:${title.length + k}`}>{word.t}</span
                    >{' '}{/each}
                </p>
                <a href={`/work/${entry.id}`}>
                  How it's built <span aria-hidden="true">→</span>
                </a>
                <span class="sheen" aria-hidden="true"></span>
              </div>
            </div>
          </li>
        {/each}
      </ol>
    </div>
  </div>
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
    position: relative;
    list-style: none;
    margin: var(--s-8) 0 0;
    padding: 0;
    display: grid;
    gap: var(--s-7);
  }

  .slot { position: relative; display: grid; }

  .flip {
    position: relative;
    height: 100%;
    transform-style: preserve-3d;
  }

  :global(.armed) .flip { will-change: transform; }

  /* ---------- the face-down side ---------- */

  .back { display: none; }

  :global(.armed) .back {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding: var(--s-5) var(--s-6);
    overflow: hidden;
    background: var(--paper-raised);
    border: 1.5px solid color-mix(in oklab, var(--accent) 45%, transparent);
    border-radius: var(--glass-radius);
    transform: rotateY(180deg);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    pointer-events: none;
  }

  .back-num {
    font-family: var(--font-display);
    font-size: clamp(7rem, 11vw, 11rem);
    font-variation-settings: 'wght' 700;
    line-height: 0.8;
    letter-spacing: -0.05em;
    color: transparent;
    -webkit-text-stroke: 1.5px var(--accent);
  }

  /* ---------- the face ---------- */

  .card {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    padding: var(--s-6);
    border: 1.5px solid var(--glass-border);
    border-radius: var(--glass-radius);
    box-shadow: var(--shadow-hard);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))
      translate(var(--tx, 0px), var(--ty, 0px));
    transition: transform 320ms var(--ease-out), box-shadow 420ms var(--ease-out);
  }

  @media (hover: hover) {
    .slot:hover .card {
      --tx: -3px;
      --ty: -3px;
      box-shadow: var(--card-hover);
    }
  }

  /* A moonlit edge that follows the pointer around the border. */
  .card::after {
    content: '';
    position: absolute;
    inset: -1.5px;
    border-radius: inherit;
    padding: 1.5px;
    background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), #f3dfae, transparent 62%);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 280ms var(--ease);
    pointer-events: none;
  }

  @media (hover: hover) { .slot:hover .card::after { opacity: 1; } }

  /* The band of light that crosses the face as it turns up. */
  .sheen {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: inherit;
    pointer-events: none;
  }

  .sheen::before {
    content: '';
    position: absolute;
    inset: -20% -60%;
    background: linear-gradient(
      105deg,
      transparent 40%,
      color-mix(in oklab, #f3dfae 70%, transparent) 50%,
      transparent 60%
    );
    transform: translateX(var(--sh, 60%));
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

  @media (hover: hover) { .slot:hover .hint { opacity: 1; } }

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

  /* Only the words that matter stay marked at rest. */
  .w {
    border-radius: 2px;
    padding-block: 0.04em;
    background-color: color-mix(in oklab, var(--card-accent) calc(var(--rest) * 34%), transparent);
    transition: background-color 420ms var(--ease) calc(var(--k) * 10ms);
  }

  /* Hover: the whole attention map, held. */
  @media (hover: hover) {
    .slot:hover .w {
      background-color: color-mix(in oklab, var(--card-accent) calc(var(--w) * 42%), transparent);
    }
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

  @media (hover: hover) { .card a:hover { color: var(--accent); } }

  /* The whole card is the link: the anchor's own box stays small, and this
     stretches its click area over the card. */
  .card { cursor: pointer; }
  .card a::after {
    content: '';
    position: absolute;
    inset: 0;
  }
  .card:has(a:focus-visible) {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }
  .card a:focus-visible { outline: none; }

  @media (hover: none) {
    .hint { opacity: 1; }
  }

  /* ---------- words coming into focus ---------- */

  :global(.armed) .gen { display: inline-block; }

  :global(.armed) .card:not(:global(.live)) .gen { opacity: 0; }

  .card:global(.live) .gen {
    animation: focus-in 760ms cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
    animation-delay: calc(120ms + var(--k) * 26ms);
  }

  /* Then a sweep of attention crosses the text, once. */
  .card:global(.live) .w {
    animation:
      focus-in 760ms cubic-bezier(0.2, 0.7, 0.2, 1) backwards,
      heat 1500ms ease-in-out;
    animation-delay:
      calc(120ms + var(--k) * 26ms),
      calc(var(--n) * 26ms + 700ms + var(--k) * 30ms);
  }

  @keyframes focus-in {
    from { opacity: 0; filter: blur(5px); transform: translateY(0.45em); }
    to   { opacity: 1; filter: blur(0); transform: none; }
  }

  @keyframes heat {
    40% { background-color: color-mix(in oklab, var(--card-accent) calc(var(--w) * 46%), transparent); }
  }

  /* ---------- the hold ---------- */

  .work:global(.pinned) { height: 220vh; margin-block: calc(var(--slack, 0px) * -1); }

  .work:global(.pinned) .stage {
    position: sticky;
    top: 0;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .work:global(.pinned) .deck { margin-top: var(--s-6); }

  @media (width >= 60rem) {
    .deck { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-6); }
    .slot:nth-child(2) { margin-top: var(--s-6); }
  }

  @media (prefers-reduced-motion: reduce) {
    .card, .slot:hover .card { transform: none; transition: none; }
  }
</style>
