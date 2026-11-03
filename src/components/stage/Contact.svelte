<script lang="ts">
  /* The end of the page, and the one place the whole screen changes.

     The section pins to the window. As you scroll through it, acid
     green floods up from the bottom of the screen in a growing
     circle, and everything inside inverts to black on green exactly
     where the circle reaches: a second copy of the content, in the
     inverted colours, is revealed by the circle. When the flood is
     complete the green copy becomes the real one, so the link rows
     work and their hover fill is visible.

     Without script the section is simply the dark version. */
  import { onMount } from 'svelte';
  import Marker from './Marker.svelte';
  import type { Link } from '../../lib/links';

  let { links }: { links: Link[] } = $props();

  /** What the visitor will actually reach, shown on each row. */
  function handle(href: string): string {
    return href.replace(/^mailto:/, '').replace(/^https?:\/\/(www\.)?/, '');
  }

  let root: HTMLElement;
  let flood: HTMLElement;
  let done = $state(false);

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const clamp = (x: number) => Math.min(1, Math.max(0, x));
    const ease = (t: number) => t * t * (3 - 2 * t);
    let raf = 0;

    function paint() {
      raf = 0;
      const r = root.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - innerHeight));
      const f = ease(clamp(p / 0.8));
      flood.style.clipPath = `circle(${(f * 115).toFixed(2)}vmax at 50% 100%)`;
      done = f > 0.999;
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    paint();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
    };
  });
</script>

{#snippet content()}
  <div class="page contact">
    <p class="label">Talk to me</p>

    <h2>Tell me what the <Marker>problem</Marker> actually is.</h2>

    <p class="sub">
      I'm looking for an AI engineering role on a team that ships to real users.
      I'm in Mumbai, and open to remote work or moving for the right team. I'll
      tell you honestly whether I'm the right person, including when I'm not.
    </p>

    <ul class="rows">
      {#each links as link (link.label)}
        <li>
          {#if link.href}
            <a href={link.href} rel={link.external ? 'noreferrer noopener me' : undefined}>
              <span class="what">{link.label}</span>
              <span class="handle">{handle(link.href)}</span>
              <span class="arrow" aria-hidden="true">→</span>
            </a>
          {:else}
            <span class="missing">{link.label} ⟨ missing ⟩</span>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
{/snippet}

<div class="root" bind:this={root}>
  <div class="sticky">
    <div class="layer base" class:lime={done}>{@render content()}</div>
    <!-- The inverted copy. Decorative: it only exists to be revealed. -->
    <div class="layer lime top" class:off={done} bind:this={flood} aria-hidden="true" inert>{@render content()}</div>
  </div>
</div>

<style>
  .root { height: 250vh; position: relative; }

  .sticky {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
  }

  .layer {
    position: absolute;
    inset: 0;
    display: grid;
    align-content: center;
    background: var(--paper);
    color: var(--ink);
  }

  /* The flooded colours. */
  .lime {
    --paper: #d7ff3a;
    --ink: #0e0f10;
    --ink-soft: #2a3300;
    --ink-faint: #3d4a00;
    --accent: #0e0f10;
    --accent-soft: rgba(14, 15, 16, 0.16);
  }

  .top {
    clip-path: circle(0vmax at 50% 100%);
    pointer-events: none;
  }

  /* Once the flood is complete the real, green layer takes over. */
  .top.off { visibility: hidden; }

  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2.25rem, 4.6vw + 1rem, 5.25rem);
    font-variation-settings: 'wght' 560;
    line-height: 0.98;
    letter-spacing: -0.035em;
    max-width: 14ch;
  }

  .sub {
    margin-top: var(--s-5);
    max-width: 42ch;
    font-size: var(--t-lg);
    color: var(--ink-soft);
  }

  .rows {
    list-style: none;
    margin: var(--s-7) 0 0;
    padding: 0;
    border-top: 1.5px solid var(--ink);
  }

  li { border-bottom: 1.5px solid var(--ink); }

  a {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas: 'what arrow' 'handle arrow';
    align-items: center;
    column-gap: var(--s-4);
    padding: var(--s-4) var(--s-3);
    overflow: hidden;
    isolation: isolate;
    color: var(--ink);
    text-decoration: none;
    transition: color 380ms var(--ease);
  }

  /* The ink fill. */
  a::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--ink);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 460ms cubic-bezier(0.65, 0, 0.25, 1);
  }

  a:hover, a:focus-visible { color: var(--paper); }
  a:hover::before, a:focus-visible::before { transform: scaleY(1); }

  .what {
    grid-area: what;
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 2vw + 0.9rem, 3rem);
    font-variation-settings: 'wght' 520;
    line-height: 1.05;
  }

  .handle {
    grid-area: handle;
    font-size: var(--t-sm);
    color: var(--ink-soft);
    overflow-wrap: anywhere;
    transition: color 380ms var(--ease);
  }

  a:hover .handle, a:focus-visible .handle { color: var(--paper); }

  .arrow {
    grid-area: arrow;
    font-size: var(--t-2xl);
    transition: transform 420ms var(--ease-out);
  }

  a:hover .arrow { transform: translateX(8px); }

  .missing { display: block; padding: var(--s-4) var(--s-3); color: var(--ink-faint); }

  /* A short window: tighten so the whole section still fits one screen. */
  @media (height < 36rem) {
    .sub { display: none; }
    .rows { margin-top: var(--s-5); }
  }
</style>
