<script lang="ts">
  /* ---------------------------------------------------------------
     The page's background: a blueprint grid.

     A fixed lattice of points, drawn once per frame. Three things
     disturb it and nothing else does:

       1. the cursor — points near it brighten and push outward,
          settling back as it leaves
       2. a scan line — sweeps down every few seconds, lighting the
          row it crosses, then gone
       3. the section in view — each band asks for an intensity
          through data-field, so reading sections let it recede

     Structured, not organic. It has no motion of its own: a page
     that is being read should be still, and only respond when the
     reader does something. That is the opposite of the drifting
     trails this replaced.
     --------------------------------------------------------------- */
  import { onMount } from 'svelte';

  let {
    /** Grid pitch in CSS pixels. */
    spacing = 30,
  }: { spacing?: number } = $props();

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;
    let running = true;

    const pointer = { x: -9999, y: -9999 };
    /** Eased so the lattice settles rather than snapping. */
    const eased = { x: -9999, y: -9999 };

    let intensity = 1;
    let targetIntensity = 1;
    let parallax = 0;

    /** Scan sweep: -1 means idle. */
    let scan = -1;
    let nextScan = 0;

    let ruleColor = 'rgba(43,51,87,1)';
    let accentColor = '#7dd3fc';

    function readTheme() {
      const s = getComputedStyle(document.documentElement);
      ruleColor = s.getPropertyValue('--rule').trim() || '#2b3357';
      accentColor = s.getPropertyValue('--accent').trim() || '#7dd3fc';
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
      cols = Math.ceil(w / spacing) + 2;
      rows = Math.ceil(h / spacing) + 2;
    }

    const REACH = 170;

    function draw(now: number) {
      if (!running) return;

      eased.x += (pointer.x - eased.x) * 0.12;
      eased.y += (pointer.y - eased.y) * 0.12;
      intensity += (targetIntensity - intensity) * 0.05;

      if (scan < 0 && now > nextScan) scan = -0.08;
      if (scan >= -0.08 && scan < 1.15) scan += 0.0075;
      if (scan >= 1.15) {
        scan = -1;
        nextScan = now + 6500 + Math.random() * 4000;
      }

      const scanY = scan >= 0 ? scan * h : -9999;

      ctx.clearRect(0, 0, w, h);

      // Two passes so fillStyle is set twice per frame rather than
      // once per point — the difference is measurable at ~2500 points.
      const hot: number[] = [];

      ctx.fillStyle = ruleColor;
      ctx.globalAlpha = 0.5 * intensity;

      for (let ix = 0; ix < cols; ix++) {
        const bx = ix * spacing;
        for (let iy = 0; iy < rows; iy++) {
          const by = iy * spacing - parallax;

          const dx = bx - eased.x;
          const dy = by - eased.y;
          const d2 = dx * dx + dy * dy;

          let heat = 0;
          let px = bx;
          let py = by;

          if (d2 < REACH * REACH) {
            const d = Math.sqrt(d2) || 0.0001;
            const f = 1 - d / REACH;
            heat = f * f;
            // Push outward from the cursor, a few pixels at most.
            const shove = heat * 7;
            px += (dx / d) * shove;
            py += (dy / d) * shove;
          }

          if (scanY > -9998) {
            const sd = Math.abs(by - scanY);
            if (sd < 46) heat = Math.max(heat, (1 - sd / 46) ** 2);
          }

          if (heat > 0.04) {
            hot.push(px, py, heat);
          } else {
            ctx.fillRect(px - 0.75, py - 0.75, 1.5, 1.5);
          }
        }
      }

      ctx.fillStyle = accentColor;
      for (let i = 0; i < hot.length; i += 3) {
        const heat = hot[i + 2];
        const size = 1.5 + heat * 2.4;
        ctx.globalAlpha = (0.22 + heat * 0.78) * intensity;
        ctx.fillRect(hot[i] - size / 2, hot[i + 1] - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    function onPointer(event: PointerEvent) {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    }

    function onLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }

    function onScroll() {
      // A slow drift so scrolling moves the lattice a little. The
      // modulo keeps it seamless: the grid never visibly restarts.
      parallax = (scrollY * 0.12) % spacing;

      const band = document
        .elementsFromPoint(innerWidth / 2, innerHeight * 0.5)
        .find((el) => (el as HTMLElement).dataset?.field) as HTMLElement | undefined;
      targetIntensity = band ? Number(band.dataset.field) : 1;
    }

    function onVisibility() {
      running = !document.hidden;
      if (running) draw(performance.now());
      else cancelAnimationFrame(raf);
    }

    readTheme();
    resize();
    onScroll();

    addEventListener('resize', resize, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    if (reduced.matches) {
      // A still lattice. It is background; it never carries meaning.
      intensity = targetIntensity;
      scan = -1;
      nextScan = Infinity;
      draw(0);
      running = false;
      cancelAnimationFrame(raf);
    } else {
      addEventListener('pointermove', onPointer, { passive: true });
      document.addEventListener('pointerleave', onLeave);
      nextScan = performance.now() + 2200;
      draw(performance.now());
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize);
      removeEventListener('scroll', onScroll);
      removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  });
</script>

<div class="field" aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .field {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  canvas { display: block; }
</style>
