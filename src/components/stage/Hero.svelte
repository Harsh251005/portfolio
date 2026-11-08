<script lang="ts">
  /* The first screen: who, and what.

     The name is a solid block. Each letter starts lying flat and stands
     up on its baseline, one after another, overshooting a touch and
     settling; the block's depth grows behind it as it rises. After that
     it tilts toward the pointer (src/lib/motion/solid-name.ts), and on a
     phone it sways slowly on its own.

     The letters are ordinary text from the start. Standing up is a CSS
     animation that only runs once the page is marked as running script,
     and it ends with the letters upright, so without script, or with
     reduced motion, the name is just there. */
  import { onMount } from 'svelte';
  import Marker from './Marker.svelte';
  import { RESUME } from '../../lib/links';
  import { solidName } from '../../lib/motion/solid-name';

  interface Props {
    role: string;
    location: string;
    status?: string;
  }

  const { role, location, status }: Props = $props();

  const first = 'Harsh'.split('');
  const last = 'Dharnidharka'.split('');

  let name: HTMLElement;

  /** Match the CSS: when the first letter starts, the gap between letters, and how long each takes. */
  const START = 300;
  const STEP = 55;
  const STAND = 1100;

  onMount(() =>
    solidName(name, {
      growDelay: START,
      growMs: (first.length + last.length - 1) * STEP + STAND * 0.7,
      area: name.closest('section') ?? name,
    }),
  );
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
        <a class="cue" href="#work" data-scroll-progress="0.05">See what I've built <span aria-hidden="true">↓</span></a>
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

  h1 { width: fit-content; transform-origin: 40% 90%; }

  .ch {
    display: inline-block;
    font-variation-settings: 'wght' 720;
    transform-origin: 50% 88%;
  }

  /* Each letter stands up from flat on its baseline, like a sprung tile. */
  @media (prefers-reduced-motion: no-preference) {
    :global(.js) .ch {
      animation: stand 1100ms linear both;
      animation-delay: calc(300ms + var(--i) * 55ms);
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

  /* A damped spring, sampled: up past upright, back, and settle. */
  @keyframes stand {
    0%   { opacity: 0; transform: perspective(500px) rotateX(90deg); animation-timing-function: cubic-bezier(0.3, 0, 0.6, 1); }
    12%  { opacity: 1; }
    30%  { transform: perspective(500px) rotateX(-16deg); animation-timing-function: ease-in-out; }
    52%  { transform: perspective(500px) rotateX(7deg); animation-timing-function: ease-in-out; }
    72%  { transform: perspective(500px) rotateX(-2.5deg); animation-timing-function: ease-in-out; }
    88%  { transform: perspective(500px) rotateX(0.8deg); }
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
