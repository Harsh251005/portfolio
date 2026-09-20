<script lang="ts">
  /* ---------------------------------------------------------------
     The hero's living canvas.

     Particles ride a Perlin flow field. The pointer pushes them
     aside and they recover — so the surface responds to you rather
     than just playing at you. Trails come from fading the previous
     frame instead of clearing it, which is what makes the strokes
     read as motion rather than dots.

     Self-contained: delete this file and the hero still renders,
     just without the field.
     --------------------------------------------------------------- */
  import { onMount } from 'svelte';
  import { fbm } from '../../lib/motion/noise';

  let {
    /** Particle count at 1440px. Scaled down on smaller screens. */
    density = 1100,
    /** How hard the pointer pushes, in pixels. */
    push = 150,
  }: { density?: number; push?: number } = $props();

  let canvas: HTMLCanvasElement;
  let wrap: HTMLElement;

  onMount(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;

    const pointer = { x: -9999, y: -9999, active: false };

    type P = { x: number; y: number; px: number; py: number; life: number; max: number; v: number };
    let parts: P[] = [];

    /** Accent colour comes from the stylesheet, so the canvas follows
     *  the theme instead of hardcoding a second palette. */
    let stroke = 'rgba(224,122,82,0.55)';
    function readTheme() {
      const styles = getComputedStyle(document.documentElement);
      const accent = styles.getPropertyValue('--accent').trim() || '#e07a52';
      stroke = accent;
    }

    function spawn(p: P) {
      p.x = Math.random() * w;
      p.y = Math.random() * h;
      p.px = p.x;
      p.py = p.y;
      p.life = 0;
      p.max = 90 + Math.random() * 220;
      p.v = 0.6 + Math.random() * 1.1;
    }

    function resize() {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(density * Math.min(1, (w * h) / (1440 * 800)));
      parts = Array.from({ length: Math.max(180, count) }, () => {
        const p = { x: 0, y: 0, px: 0, py: 0, life: 0, max: 0, v: 1 };
        spawn(p);
        p.life = Math.random() * p.max;
        return p;
      });

      ctx.clearRect(0, 0, w, h);
    }

    let t = 0;

    function frame() {
      if (!running) return;
      t += 0.0016;

      // Fade rather than clear: this is the trail.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.055)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      ctx.lineWidth = 1;
      ctx.lineCap = 'round';

      const scale = 0.0022;

      for (const p of parts) {
        p.px = p.x;
        p.py = p.y;

        const angle = fbm(p.x * scale, p.y * scale + t) * Math.PI * 2.4;
        p.x += Math.cos(angle) * p.v;
        p.y += Math.sin(angle) * p.v;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < push * push && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (1 - d / push) ** 2 * 3.2;
            p.x += (dx / d) * force;
            p.y += (dy / d) * force;
          }
        }

        p.life++;

        if (p.life > p.max || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          spawn(p);
          continue;
        }

        // Fade in and out over the particle's life so nothing pops.
        const age = p.life / p.max;
        const alpha = Math.sin(age * Math.PI) * 0.5;

        ctx.strokeStyle = stroke;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function onPointer(event: PointerEvent) {
      const rect = wrap.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    }

    function onLeave() {
      pointer.active = false;
    }

    readTheme();
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Stop entirely when scrolled away or the tab is hidden — an
    // invisible canvas burning a core is the usual cost of effects
    // like this, and it is avoidable.
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting && !document.hidden;
        if (running) frame();
        else cancelAnimationFrame(raf);
      },
      { threshold: 0 },
    );
    io.observe(wrap);

    function onVisibility() {
      running = !document.hidden;
      if (running) frame();
      else cancelAnimationFrame(raf);
    }

    const themeObserver = new MutationObserver(readTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    if (!reduced.matches) {
      window.addEventListener('pointermove', onPointer, { passive: true });
      wrap.addEventListener('pointerleave', onLeave);
      document.addEventListener('visibilitychange', onVisibility);
      frame();
    } else {
      // Reduced motion: draw one still frame so the hero isn't empty.
      for (let i = 0; i < 400; i++) frame();
      running = false;
      cancelAnimationFrame(raf);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('pointermove', onPointer);
      wrap.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  });
</script>

<div class="field" bind:this={wrap} aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .field {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  canvas { display: block; }

  /* Keeps type legible over the busiest part of the field. */
  .field::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      120% 90% at 20% 50%,
      var(--paper) 0%,
      color-mix(in oklab, var(--paper) 72%, transparent) 38%,
      transparent 70%
    );
  }
</style>
