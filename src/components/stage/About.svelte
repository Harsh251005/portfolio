<script lang="ts">
  /* The person, not the engineer. Portrait plus the short version,
     with a parallax drift on the image as it passes. */
  import { onMount } from 'svelte';
  import TextReveal from './TextReveal.svelte';
  import Reveal from './Reveal.svelte';
  import Glass from './Glass.svelte';

  interface Props {
    /** Resolved by the build from src/images/portrait.*, or null. */
    portrait?: { src: string; width: number; height: number } | null;
  }

  const { portrait = null }: Props = $props();

  let frame: HTMLElement;
  let offset = $state(0);

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    function measure() {
      const rect = frame.getBoundingClientRect();
      // -1 entering from below, 0 centred, 1 leaving above.
      const t = (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight;
      offset = Math.max(-1, Math.min(1, t)) * -22;
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    }

    measure();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  });
</script>

<div class="page wrap">
  <div class="portrait" bind:this={frame}>
    <div class="frame">
      {#if portrait}
        <img
          src={portrait.src}
          width={portrait.width}
          height={portrait.height}
          alt="Harsh Dharnidharka"
          loading="lazy"
          decoding="async"
          style={`transform: translate3d(0, ${offset}px, 0) scale(1.12)`}
        />
      {:else}
        <!-- No photo yet. Drop one at src/images/portrait.jpg. -->
        <div class="placeholder" style={`transform: translate3d(0, ${offset}px, 0) scale(1.12)`}>
          <span>your photo<br />goes here</span>
        </div>
      {/if}
    </div>
    <p class="caption">Borivali East, Mumbai</p>
  </div>

  <Glass class="copy" lift={false}>
    <p class="label"><span class="bar" aria-hidden="true"></span>The person</p>
    <TextReveal text="Five months out, and not pretending otherwise." tag="h2" />

    <Reveal delay={120}>
      <p class="lead">
        I finished a degree in 2026 and spent the time since building things that
        run rather than things that demo. What I have is four working systems and
        the scars from each one — not a decade of tenure.
      </p>
      <p class="body">
        <span class="todo">⟨ NEEDS YOUR WORDS — what you're like away from a keyboard.
        This is the paragraph that makes someone want to work with you, and it's
        the one I can't write. ⟩</span>
      </p>

      <a class="more" href="/ask/outside-of-work">
        The longer version <span aria-hidden="true">→</span>
      </a>
    </Reveal>
  </Glass>
</div>

<style>
  .wrap { display: grid; gap: var(--s-7); }

  .frame {
    position: relative;
    aspect-ratio: 4 / 5;
    max-width: 28rem;
    overflow: hidden;
    border-radius: var(--glass-radius);
    background: rgba(9, 12, 28, 0.55);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
  }

  .frame img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    will-change: transform;
  }

  .placeholder {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    text-align: center;
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-faint);
    background-image: repeating-linear-gradient(
      -45deg,
      transparent 0 11px,
      color-mix(in oklab, var(--rule) 55%, transparent) 11px 12px
    );
    will-change: transform;
  }

  .caption {
    margin-top: var(--s-3);
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .label { display: flex; align-items: center; gap: var(--s-3); }
  .bar { width: 2rem; height: 1px; background: var(--accent); }

  :global(.copy .inner) { padding: var(--s-6); }

  .copy :global(h2) {
    margin-top: var(--s-4);
    font-family: var(--font-display);
    font-size: var(--t-2xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 400;
    line-height: var(--leading-tight);
    letter-spacing: -0.02em;
    max-width: 16ch;
  }

  .lead {
    margin-top: var(--s-5);
    font-size: var(--t-lg);
    line-height: var(--leading-snug);
    color: var(--ink);
    max-width: 40ch;
  }

  .body { margin-top: var(--s-4); font-size: var(--t-sm); color: var(--ink-soft); max-width: 44ch; }

  .more {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    margin-top: var(--s-6);
    min-height: var(--tap);
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    text-decoration: none;
  }

  @media (width >= 58rem) {
    .wrap {
      grid-template-columns: minmax(0, 0.85fr) minmax(0, 1fr);
      gap: var(--s-8);
      align-items: center;
    }
  }
</style>
