<script lang="ts">
  /* The first screen: who, what, and a face.

     The name is set in a variable font and gets heavier while you
     scroll, letter by letter, then settles when you stop — like ink
     pressing into paper. The text is plain text the whole time; the
     weight is the only thing that moves. */
  import { onMount } from 'svelte';
  import Marker from './Marker.svelte';

  interface Props {
    role: string;
    location: string;
    status?: string;
    portrait?: { src: string; width: number; height: number } | null;
  }

  const { role, location, status, portrait = null }: Props = $props();

  const first = 'Harsh'.split('');
  const last = 'Dharnidharka'.split('');

  let heavy = $state(false);

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer: ReturnType<typeof setTimeout>;
    let lastY = scrollY;

    function onScroll() {
      if (Math.abs(scrollY - lastY) > 0.5) heavy = true;
      lastY = scrollY;
      clearTimeout(timer);
      timer = setTimeout(() => (heavy = false), 260);
    }

    addEventListener('scroll', onScroll, { passive: true });
    return () => {
      removeEventListener('scroll', onScroll);
      clearTimeout(timer);
    };
  });
</script>

<section class="hero" id="main">
  <div class="page grid">
    <div class="copy">
      <p class="eyebrow">
        <span>{role}</span>
        <span class="dot" aria-hidden="true"></span>
        <span>{location}</span>
        {#if status}<span class="stamp">{status}</span>{/if}
      </p>

      <h1 class:heavy aria-label="Harsh Dharnidharka">
        <span class="line" aria-hidden="true">
          {#each first as ch, i (i)}<span class="ch" style={`--i:${i}`}>{ch}</span>{/each}
        </span>
        <span class="line" aria-hidden="true">
          {#each last as ch, i (i)}<span class="ch" style={`--i:${i + 5}`}>{ch}</span>{/each}
        </span>
      </h1>

      <p class="statement">
        I build AI that answers phones, reads documents and fixes its own code.
        <Marker>And I make sure it holds up.</Marker>
      </p>

      <a class="cue" href="#work">See what I've built <span aria-hidden="true">↓</span></a>
    </div>

    <figure class="portrait">
      <div class="frame">
        {#if portrait}
          <img
            src={portrait.src}
            width={portrait.width}
            height={portrait.height}
            alt="Harsh Dharnidharka"
            decoding="async"
          />
        {:else}
          <!-- No photo yet. Drop one at src/images/portrait.jpg. -->
          <div class="placeholder"><span>photo<br />goes here</span></div>
        {/if}
      </div>
    </figure>
  </div>
</section>

<style>
  .hero {
    min-height: 100svh;
    display: flex;
    align-items: center;
    padding-block: clamp(5rem, 12vh, 8rem) var(--s-8);
  }

  .grid { display: grid; gap: var(--s-8); align-items: center; }

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

  .line { display: block; overflow-wrap: anywhere; }

  .ch {
    display: inline-block;
    font-variation-settings: 'opsz' 72, 'wght' 430, 'SOFT' 0, 'WONK' 1;
    transition: font-variation-settings 650ms var(--ease-out) calc(var(--i) * 40ms);
  }

  .heavy .ch { font-variation-settings: 'opsz' 72, 'wght' 800, 'SOFT' 0, 'WONK' 1; }

  .statement {
    margin-top: var(--s-6);
    max-width: 30ch;
    font-family: var(--font-display);
    font-size: var(--t-xl);
    font-variation-settings: 'opsz' 28, 'wght' 380;
    line-height: 1.3;
    color: var(--ink-soft);
  }

  .cue {
    margin-top: var(--s-6);
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

  .portrait { margin: 0; position: relative; justify-self: start; width: min(100%, 20rem); }

  .frame {
    aspect-ratio: 4 / 5;
    overflow: hidden;
    border: 1.5px solid var(--glass-border);
    border-radius: var(--glass-radius);
    background: var(--paper-sunk);
    box-shadow: var(--shadow-hard);
  }

  .frame img { width: 100%; height: 100%; object-fit: cover; }

  .placeholder {
    height: 100%;
    display: grid;
    place-items: center;
    text-align: center;
    font-size: var(--t-sm);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-faint);
    background: repeating-linear-gradient(135deg, transparent 0 10px, var(--rule-soft) 10px 11px);
  }

  @media (width >= 60rem) {
    .grid { grid-template-columns: minmax(0, 1.55fr) minmax(0, 0.8fr); }
    .portrait { justify-self: end; }
    .statement { font-size: var(--t-2xl); max-width: 26ch; }
  }
</style>
