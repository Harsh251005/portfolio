<script lang="ts">
  /* The first screen: who, and what.

     The name arrives two ways at once. Each letter drops in from above,
     tilted, and bounces to rest; while it falls it is a scrambled
     symbol, and it resolves into the real letter as it lands. Hover
     the name and it scrambles and resolves again.

     The letters are ordinary text from the start. The drop is a CSS
     animation that only runs once the page is marked as running
     script, and the scramble swaps the text only after that, so
     without script, or with reduced motion, the name is just there. */
  import { onMount } from 'svelte';
  import Marker from './Marker.svelte';
  import { RESUME } from '../../lib/links';

  interface Props {
    role: string;
    location: string;
    status?: string;
  }

  const { role, location, status }: Props = $props();

  const first = 'Harsh'.split('');
  const last = 'Dharnidharka'.split('');

  let name: HTMLElement;

  const GLYPHS = '▮▯░▒▓#@$%&01<>/\\|=+*';
  /** Matches the CSS: when the first letter starts, and the gap between letters. */
  const START = 750;
  const STEP = 65;
  /** How long a letter stays a symbol before it lands as itself. */
  const FALL = 520;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const letters = Array.from(name.querySelectorAll<HTMLElement>('.ch'));
    const real = letters.map((l) => l.textContent ?? '');
    const timers = new Set<ReturnType<typeof setTimeout>>();

    // A symbol is not the same width as the letter it hides. Pin each
    // slot to its letter's width so the name never jitters.
    // Layout width, not the bounding box: at this moment each letter is
    // still tilted at the start of its drop, and a tilted box is wider.
    letters.forEach((l) => (l.style.width = getComputedStyle(l).width));

    /** Show symbols from `delay` ms for `span` ms, then the real letter. */
    function scramble(i: number, delay: number, span: number) {
      const el = letters[i];
      const begin = performance.now() + delay;
      const tick = () => {
        if (performance.now() - begin >= span) {
          el.textContent = real[i];
          el.classList.remove('glyph');
          return;
        }
        el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        el.classList.add('glyph');
        timers.add(setTimeout(tick, 45));
      };
      timers.add(setTimeout(tick, delay));
    }

    letters.forEach((_, i) => scramble(i, START + i * STEP, FALL));

    let busy = true;
    timers.add(setTimeout(() => (busy = false), START + letters.length * STEP + FALL + 300));

    const replay = () => {
      if (busy) return;
      busy = true;
      letters.forEach((_, i) => scramble(i, i * 28, 340 + i * 28));
      timers.add(setTimeout(() => (busy = false), 340 + letters.length * 28 + 400));
    };

    name.addEventListener('pointerenter', replay);
    return () => {
      name.removeEventListener('pointerenter', replay);
      timers.forEach(clearTimeout);
    };
  });
</script>

<section class="hero" id="main">
  <div class="page">
    <div class="copy">
      <p class="eyebrow">
        <span>{role}</span>
        <span class="dot" aria-hidden="true"></span>
        <span>{location}</span>
        {#if status}<span class="stamp">{status}</span>{/if}
      </p>

      <h1 bind:this={name} aria-label="Harsh Dharnidharka">
        <span class="line" aria-hidden="true">
          {#each first as ch, i (i)}<span class="ch" style={`--i:${i}`}>{ch}</span>{/each}
        </span>
        <span class="line" aria-hidden="true">
          {#each last as ch, i (i)}<span class="ch" style={`--i:${i + 5}`}>{ch}</span>{/each}
        </span>
      </h1>

      <p class="statement">
        I build AI products people can actually rely on.
        <Marker delay={1900}>Then I try to break them, so your users don’t.</Marker>
      </p>

      <div class="cues">
        <a class="cue" href="#work">See what I've built <span aria-hidden="true">↓</span></a>
        <a class="cue" href={RESUME}>Resume <span aria-hidden="true">↗</span></a>
      </div>
    </div>

  </div>
</section>

<style>
  .hero {
    min-height: 100svh;
    display: flex;
    align-items: center;
    padding-block: clamp(5rem, 12vh, 8rem) var(--s-8);
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    flex-wrap: wrap;
    font-family: var(--font-label);
    font-size: var(--t-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }

  .dot { width: 0.3rem; height: 0.3rem; border-radius: 50%; background: var(--accent); }

  /* A small status tag. */
  .stamp {
    margin-left: var(--s-2);
    padding: 0.2rem 0.6rem;
    border: 1.5px solid var(--accent);
    border-radius: 3px;
    color: var(--accent);
    font-size: var(--t-xs);
  }

  h1 {
    margin-top: var(--s-5);
    font-family: var(--font-display);
    font-size: calc(clamp(2.75rem, 5.2vw + 1.6rem, 7rem) * var(--hero-scale));
    line-height: 0.92;
    letter-spacing: -0.03em;
    color: var(--ink);
    min-width: 0;
  }

  .line { display: block; white-space: nowrap; }

  .ch {
    display: inline-block;
    text-align: center;
    font-variation-settings: 'wght' 580;
    transition: color 650ms var(--ease);
  }

  /* While it is still a symbol. */
  .ch.glyph {
    font-family: var(--font-mono);
    font-variation-settings: 'wght' 500;
    color: var(--accent);
    transition: none;
  }

  .ch:nth-child(odd)  { --r: -26deg; }
  .ch:nth-child(even) { --r: 26deg; }

  @media (prefers-reduced-motion: no-preference) {
    :global(.js) .ch {
      animation: drop 1000ms cubic-bezier(0.25, 0.9, 0.3, 1) both;
      animation-delay: calc(750ms + var(--i) * 65ms);
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    :global(.js) .statement,
    :global(.js) .cues {
      animation: settle 1000ms var(--ease-out) 1100ms both;
    }
  }

  @keyframes settle {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: none; }
  }

  @keyframes drop {
    0%   { opacity: 0; transform: translateY(-160%) rotate(var(--r)); }
    55%  { opacity: 1; transform: translateY(9%) rotate(calc(var(--r) * -0.18)); }
    75%  { transform: translateY(-4%) rotate(calc(var(--r) * 0.06)); }
    100% { opacity: 1; transform: none; }
  }

  .statement {
    margin-top: var(--s-6);
    max-width: 30ch;
    font-family: var(--font-display);
    font-size: var(--t-xl);
    font-variation-settings: 'wght' 380;
    line-height: 1.3;
    color: var(--ink-soft);
  }

  .cues {
    margin-top: var(--s-6);
    display: flex;
    flex-wrap: wrap;
    gap: var(--s-2) var(--s-6);
  }

  .cue {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    min-height: var(--tap);
    font-variation-settings: 'wght' 600;
    color: var(--ink);
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 0.3em;
    text-decoration-color: var(--accent);
  }

  .cue:hover { color: var(--accent); }

  @media (width >= 60rem) {
    .statement { font-size: var(--t-2xl); max-width: 26ch; }
  }
</style>
