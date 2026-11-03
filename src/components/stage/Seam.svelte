<script lang="ts">
  /* ---------------------------------------------------------------
     The seam.

     A cricket ball runs down a stitched line in the left margin as
     you read. The ball is placed by how far through the page you
     are, and it spins by the distance scrolled — the way a ball
     actually rolls, angle = distance / radius — so scrolling faster
     spins it faster and stopping stops it. Behind it the stitches
     turn red, so the line is also a progress mark.

     It is decoration with one job (where am I on the page), and it
     holds no content, so nothing depends on it running.
     --------------------------------------------------------------- */
  import { onMount } from 'svelte';

  let seam: HTMLElement;
  let ball: SVGElement;
  let trail: HTMLElement;

  onMount(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let angle = 0;
    let lastY = scrollY;

    function frame() {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;

      // An SVG element has no offsetWidth; the rail is exactly one ball wide.
      const size = seam.offsetWidth;
      const pad = size * 0.8;
      const y = pad + p * (innerHeight - pad * 2 - size);

      // Rolling without slipping: angle (deg) = distance / radius.
      if (!reduced) angle += ((scrollY - lastY) / (size / 2)) * (180 / Math.PI) * 0.12;
      lastY = scrollY;

      ball.style.transform = `translate3d(0, ${y}px, 0) rotate(${angle}deg)`;
      trail.style.height = `${y + size / 2}px`;
    }

    function schedule() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    frame();
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
    };
  });
</script>

<div class="seam" bind:this={seam} aria-hidden="true">
  <span class="line"></span>
  <span class="line red" bind:this={trail}></span>
  <svg class="ball" bind:this={ball} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11" fill="var(--accent)" />
    <path d="M3.4 8.2 C9 13.6 15 13.6 20.6 8.2" fill="none" stroke="var(--paper-raised)" stroke-width="1.1" stroke-dasharray="1.7 1.5" />
    <path d="M2.7 11.2 C8.8 16.8 15.2 16.8 21.3 11.2" fill="none" stroke="var(--paper-raised)" stroke-width="1.1" stroke-dasharray="1.7 1.5" />
  </svg>
</div>

<style>
  .seam {
    --d: 0.9rem;
    position: fixed;
    top: 0;
    bottom: 0;
    /* Centred in the page's left gutter, wherever the page sits. */
    left: max(0.2rem, calc((100vw - var(--page-max)) / 2 + var(--gutter) / 2 - var(--d) / 2));
    width: var(--d);
    z-index: 5;
    pointer-events: none;
  }

  @media (width >= 60rem) { .seam { --d: 1.35rem; } }

  .line {
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    translate: -50% 0;
    background: repeating-linear-gradient(to bottom, var(--rule) 0 6px, transparent 6px 12px);
  }

  .line.red {
    bottom: auto;
    height: 0;
    background: repeating-linear-gradient(to bottom, var(--accent) 0 6px, transparent 6px 12px);
  }

  .ball {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--d);
    height: var(--d);
    will-change: transform;
  }
</style>
