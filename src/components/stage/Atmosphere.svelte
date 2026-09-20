<script lang="ts">
  /* ---------------------------------------------------------------
     The site's environment.

     A single field of particles living behind every section, not a
     hero decoration. Three things drive it:

       1. TEMPERATURE — the visitor's control. At 0 the particles are
          locked to a grid and draw straight, deterministic traces.
          At 1 they follow the noise field freely and turn to smoke.
          It is the same parameter that governs randomness in a
          language model, doing visibly the same thing, which is the
          one joke on this site that is also an explanation.

       2. THE SECTION IN VIEW — each band asks for its own intensity,
          so the page breathes rather than humming at one level.

       3. THE HOUR IN MUMBAI — a slight warm-to-cool drift across the
          day. Subtle enough that most people will never notice, which
          is the point.

     Legibility comes first: this sits behind content at low opacity
     and content always sits on a solid surface. An environment that
     makes the words hard to read has failed at being an environment.
     --------------------------------------------------------------- */
  import { onMount } from 'svelte';
  import { fbm } from '../../lib/motion/noise';

  let { density = 750 }: { density?: number } = $props();

  /** 0 = ordered, 1 = chaotic. Starts slightly ordered so the first
   *  impression is precision rather than noise. */
  let temperature = $state(0.35);
  let showDial = $state(false);

  let canvas: HTMLCanvasElement;
  let wrap: HTMLElement;

  const STOPS = [
    { at: 0, label: 'deterministic' },
    { at: 0.35, label: 'considered' },
    { at: 0.7, label: 'loose' },
    { at: 1, label: 'unhinged' },
  ];

  const mood = $derived(
    [...STOPS].reverse().find((s) => temperature >= s.at - 0.001)?.label ?? 'considered',
  );

  onMount(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;

    /** Eased toward the target so dragging the dial feels like a
     *  system settling, not a value snapping. */
    let temp = temperature;
    let intensity = 1;
    let targetIntensity = 1;

    const pointer = { x: -9999, y: -9999, active: false };

    type P = { x: number; y: number; px: number; py: number; life: number; max: number; v: number };
    let parts: P[] = [];
    let stroke = '#ff7043';

    function readAccent() {
      stroke =
        getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff7043';
    }

    function spawn(p: P) {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.px = p.x;
      p.py = p.y;
      p.life = 0;
      p.max = 120 + Math.random() * 260;
      p.v = 0.5 + Math.random() * 1.0;
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth;
      h = innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(density * Math.min(1, (w * h) / (1440 * 900)));
      parts = Array.from({ length: Math.max(220, count) }, () => {
        const p = { x: 0, y: 0, px: 0, py: 0, life: 0, max: 0, v: 1 };
        spawn(p);
        p.life = Math.random() * p.max;
        return p;
      });
      ctx.clearRect(0, 0, w, h);
    }

    let t = 0;
    const QUARTER = Math.PI / 2;

    function frame() {
      if (!running) return;

      temp += (temperature - temp) * 0.06;
      intensity += (targetIntensity - intensity) * 0.04;

      // Cold runs slow and straight; hot runs fast and turbulent.
      t += 0.0004 + temp * 0.0026;

      // Longer trails when ordered, shorter when chaotic — but the
      // floor is high enough that the field reaches a sparse
      // equilibrium instead of saturating the screen. At a lower
      // fade the traces never clear and the text loses the fight.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0,0,0,${0.05 + temp * 0.05})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      ctx.lineWidth = 1;
      ctx.lineCap = temp < 0.25 ? 'butt' : 'round';
      ctx.strokeStyle = stroke;

      const scale = 0.0013 + temp * 0.0016;
      const speed = 0.55 + temp * 1.15;

      for (const p of parts) {
        p.px = p.x;
        p.py = p.y;

        const free = fbm(p.x * scale, p.y * scale + t) * Math.PI * 2.4;
        // Snap to the nearest right angle, then release toward the
        // free angle as temperature rises. This single line is the
        // whole effect: circuit traces at 0, smoke at 1.
        const snapped = Math.round(free / QUARTER) * QUARTER;
        const angle = snapped + (free - snapped) * temp;

        const v = p.v * speed;
        p.x += Math.cos(angle) * v;
        p.y += Math.sin(angle) * v;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const r = 170;
          if (d2 < r * r && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (1 - d / r) ** 2 * 3;
            p.x += (dx / d) * force;
            p.y += (dy / d) * force;
          }
        }

        p.life++;
        if (p.life > p.max || p.x < -30 || p.x > w + 30 || p.y < -30 || p.y > h + 30) {
          spawn(p);
          continue;
        }

        // Hot trails clear faster, so they are drawn brighter — both
        // ends of the dial should feel equally present, just different.
        const weight = 0.24 * (1 + temp * 0.75);
        ctx.globalAlpha = Math.sin((p.life / p.max) * Math.PI) * weight * intensity;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function onPointer(event: PointerEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }

    /** Each band can ask the field to calm down or pick up. */
    function readSection() {
      const band = document
        .elementsFromPoint(innerWidth / 2, innerHeight * 0.5)
        .find((el) => (el as HTMLElement).dataset?.field) as HTMLElement | undefined;
      targetIntensity = band ? Number(band.dataset.field) : 1;
    }

    function onVisibility() {
      running = !document.hidden;
      if (running) frame();
      else cancelAnimationFrame(raf);
    }

    readAccent();
    resize();
    readSection();

    addEventListener('resize', resize, { passive: true });
    addEventListener('scroll', readSection, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    if (!reduced.matches) {
      addEventListener('pointermove', onPointer, { passive: true });
      frame();
      showDial = true;
    } else {
      // One still frame, then stop. The field is decoration; it is
      // never the only thing carrying meaning.
      for (let i = 0; i < 260; i++) frame();
      running = false;
      cancelAnimationFrame(raf);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
      removeEventListener('scroll', readSection);
      removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  });
</script>

<div class="atmos" bind:this={wrap} aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
</div>

{#if showDial}
  <div class="dial">
    <label for="temp">
      <span class="name">Temperature</span>
      <span class="value">{temperature.toFixed(2)}</span>
    </label>

    <input
      id="temp"
      type="range"
      min="0"
      max="1"
      step="0.01"
      bind:value={temperature}
      aria-describedby="temp-hint"
    />

    <p class="hint" id="temp-hint">
      <span class="ends">ordered</span>
      <span class="mood">{mood}</span>
      <span class="ends">chaotic</span>
    </p>
  </div>
{/if}

<style>
  .atmos {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  canvas { display: block; }

  .dial {
    position: fixed;
    z-index: 45;
    right: var(--gutter);
    bottom: var(--s-5);
    width: 12.5rem;
    padding: var(--s-4);
    border: 1px solid var(--rule);
    border-radius: var(--radius-lg);
    background: color-mix(in oklab, var(--paper) 86%, transparent);
    backdrop-filter: blur(14px);
    box-shadow: var(--shadow);
  }

  label {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--s-3);
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .value {
    color: var(--accent);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0;
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: var(--tap);
    margin-block: calc(var(--s-2) * -1);
    background: transparent;
    cursor: ew-resize;
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 1px;
    background: var(--rule);
  }
  input[type='range']::-moz-range-track {
    height: 1px;
    background: var(--rule);
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 0.75rem;
    height: 0.75rem;
    margin-top: -0.375rem;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 4px color-mix(in oklab, var(--accent) 22%, transparent);
    transition: box-shadow 200ms var(--ease);
  }
  input[type='range']::-moz-range-thumb {
    width: 0.75rem;
    height: 0.75rem;
    border: 0;
    border-radius: 50%;
    background: var(--accent);
  }

  input[type='range']:hover::-webkit-slider-thumb,
  input[type='range']:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 7px color-mix(in oklab, var(--accent) 26%, transparent);
  }

  .hint {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--s-2);
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .ends { opacity: 0.55; }
  .mood { color: var(--ink-soft); }

  /* On a phone the dial would cover content and there is no cursor to
     push the field with, so it stays on larger screens. */
  @media (width < 48rem) {
    .dial { display: none; }
  }
</style>
