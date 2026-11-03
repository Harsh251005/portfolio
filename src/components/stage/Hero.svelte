<script lang="ts">
  /* The first screen: who, what, and a face.

     The name is set in a variable font, and each letter's weight
     follows the pointer: the nearer a letter is to the cursor, the
     heavier it gets, and it eases back when the cursor moves on.
     Attention flows to where you point. On load one wave runs
     through the name by itself, so the effect announces itself.
     Touch screens have no cursor, so there the name thickens while
     you scroll instead.

     The text is plain text throughout; only its weight moves. */
  import { onMount } from 'svelte';
  import TokenStream from './TokenStream.svelte';

  interface Props {
    role: string;
    location: string;
    status?: string;
    portrait?: { src: string; width: number; height: number } | null;
  }

  const { role, location, status, portrait = null }: Props = $props();

  const first = 'Harsh'.split('');
  const last = 'Dharnidharka'.split('');

  let name: HTMLElement;
  let heavy = $state(false);

  const REST = 430;
  const MAX = 850;
  /** How far the pointer's influence reaches, in px. */
  const REACH = 170;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const letters = Array.from(name.querySelectorAll<HTMLElement>('.ch'));
    const fine = matchMedia('(pointer: fine)').matches;

    // Touch: thicken while scrolling, settle when it stops.
    if (!fine) {
      let timer: ReturnType<typeof setTimeout>;
      let lastY = scrollY;
      const onScroll = () => {
        if (Math.abs(scrollY - lastY) > 0.5) heavy = true;
        lastY = scrollY;
        clearTimeout(timer);
        timer = setTimeout(() => (heavy = false), 260);
      };
      addEventListener('scroll', onScroll, { passive: true });
      return () => {
        removeEventListener('scroll', onScroll);
        clearTimeout(timer);
      };
    }

    name.classList.add('ptr');

    const cur = letters.map(() => REST);
    let px = -9999;
    let py = -9999;
    let raf = 0;
    let introStart = performance.now() + 900;
    let intro = true;
    let moved = false;

    function tick(now: number) {
      raf = 0;
      const box = name.getBoundingClientRect();

      // Until the visitor moves, a virtual pointer sweeps the name once.
      if (intro && !moved) {
        const k = (now - introStart) / 1500;
        if (k >= 0 && k <= 1.25) {
          px = box.left + k * box.width;
          py = box.top + box.height * 0.5;
        } else if (k > 1.25) {
          intro = false;
          px = py = -9999;
        }
      }

      let busy = intro && !moved;
      letters.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const dx = px - (r.left + r.width / 2);
        const dy = py - (r.top + r.height / 2);
        const near = Math.exp(-((dx * dx + dy * dy) / (REACH * REACH)));
        const goal = REST + (MAX - REST) * near;
        cur[i] += (goal - cur[i]) * 0.18;
        if (Math.abs(goal - cur[i]) > 0.6) busy = true;
        el.style.fontVariationSettings = `'opsz' 72, 'wght' ${cur[i].toFixed(1)}, 'SOFT' 0, 'WONK' 1`;
      });

      if (busy || px > -9000) raf = requestAnimationFrame(tick);
    }

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      moved = true;
      px = e.clientX;
      py = e.clientY;
      wake();
    };
    const onLeave = () => {
      px = py = -9999;
      wake();
    };

    addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    wake();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
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

      <h1 class:heavy bind:this={name} aria-label="Harsh Dharnidharka">
        <span class="line" aria-hidden="true">
          {#each first as ch, i (i)}<span class="ch" style={`--i:${i}`}>{ch}</span>{/each}
        </span>
        <span class="line" aria-hidden="true">
          {#each last as ch, i (i)}<span class="ch" style={`--i:${i + 5}`}>{ch}</span>{/each}
        </span>
      </h1>

      <p class="statement">
        <TokenStream
          start={700}
          parts={[
            { text: 'I build AI that answers phones, reads documents and fixes its own code. ' },
            { text: 'And I make sure it holds up.', mark: true },
          ]}
        />
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

  .line { display: block; white-space: nowrap; }

  .ch {
    display: inline-block;
    font-variation-settings: 'opsz' 72, 'wght' 430, 'SOFT' 0, 'WONK' 1;
    transition: font-variation-settings 650ms var(--ease-out) calc(var(--i) * 40ms);
  }

  .heavy .ch { font-variation-settings: 'opsz' 72, 'wght' 800, 'SOFT' 0, 'WONK' 1; }

  /* With a pointer, weight is set every frame from script. */
  .ptr .ch { transition: none; }

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
    border: 1.5px solid var(--rule);
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
