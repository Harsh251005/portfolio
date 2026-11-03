<script lang="ts">
  /* The photo, the way a model might first see it. It arrives as a grid
     of lime symbols, each picked by how bright that part of the photo
     is, so the face is already there in text. Then a wave runs down the
     frame and resolves it, cell by cell, into the real photo. The same
     symbols come back under the pointer.

     The photo is a plain <img> from the start. The canvas only sits on
     top of it. If script is slow or never runs, a CSS timer shows the
     photo anyway, and with reduced motion it is simply there. */
  import { onMount } from 'svelte';

  let { src, width, height, alt }: { src: string; width: number; height: number; alt: string } =
    $props();

  let frame: HTMLElement;
  let img: HTMLImageElement;
  let canvas: HTMLCanvasElement;

  /** Size of one symbol, in CSS pixels. */
  const CELL = 8;
  /** Darkest to brightest. */
  const RAMP = ' .:-=+*#%@';
  const LIME = '#d7ff3a';
  const GROUND = '#141517';
  /** How long a cell keeps its lime flash after it resolves, in ms. */
  const FLASH = 240;
  const LENS = 70;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // A very slow start: the CSS timer has already shown the photo, so
    // don't take it away again. The pointer effect still works.
    const intro = getComputedStyle(img).opacity === '0';
    if (intro) frame.classList.add('decoding');

    let cols = 0;
    let rows = 0;
    let w = 0;
    let h = 0;
    let glyph: string[] = [];
    let bright: number[] = [];
    let appear: number[] = [];
    let resolve: number[] = [];
    let heat: number[] = [];
    let begin = 0;
    let raf = 0;
    let ready = false;

    /** Reads the photo into the grid, cropped exactly as object-fit: cover crops it. */
    const build = () => {
      const box = frame.getBoundingClientRect();
      w = frame.clientWidth;
      h = frame.clientHeight;
      if (!w || !h || !box.width) return false;
      const dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${CELL * 1.15}px ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);

      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const scale = Math.max(w / nw, h / nh);
      const sw = w / scale;
      const sh = h / scale;

      const sample = document.createElement('canvas');
      sample.width = cols;
      sample.height = rows;
      const s = sample.getContext('2d', { willReadFrequently: true })!;
      s.drawImage(img, (nw - sw) / 2, (nh - sh) / 2, sw, sh, 0, 0, cols, rows);
      const data = s.getImageData(0, 0, cols, rows).data;

      const lum: number[] = [];
      let lo = 1;
      let hi = 0;
      for (let i = 0; i < cols * rows; i++) {
        const l = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
        lum.push(l);
        lo = Math.min(lo, l);
        hi = Math.max(hi, l);
      }
      const range = hi - lo || 1;
      bright = lum.map((l) => (l - lo) / range);
      glyph = bright.map((b) => RAMP[Math.min(RAMP.length - 1, Math.floor(b * RAMP.length))]);
      heat = bright.map(() => 0);
      appear = bright.map(() => 150 + Math.random() * 520);
      resolve = bright.map((_, i) => 1150 + (Math.floor(i / cols) / rows) * 1300 + Math.random() * 280);
      return true;
    };

    const cellGlyph = (i: number) => {
      ctx.globalAlpha = (0.22 + 0.78 * bright[i]) * ctx.globalAlpha;
      ctx.fillStyle = LIME;
      ctx.fillText(glyph[i], (i % cols) * CELL + CELL / 2, Math.floor(i / cols) * CELL + CELL / 2);
    };

    const draw = (now: number) => {
      raf = 0;
      const e = intro ? now - begin : Infinity;
      let busy = false;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < heat.length; i++) {
        const x = (i % cols) * CELL;
        const y = Math.floor(i / cols) * CELL;

        if (e < resolve[i]) {
          busy = true;
          ctx.globalAlpha = 1;
          ctx.fillStyle = GROUND;
          ctx.fillRect(x, y, CELL, CELL);
          if (e > appear[i]) cellGlyph(i);
        } else if (e < resolve[i] + FLASH) {
          busy = true;
          ctx.globalAlpha = (1 - (e - resolve[i]) / FLASH) * 0.75;
          ctx.fillStyle = LIME;
          ctx.fillRect(x, y, CELL, CELL);
        }

        if (heat[i] > 0.02) {
          busy = true;
          ctx.globalAlpha = heat[i] * 0.9;
          ctx.fillStyle = GROUND;
          ctx.fillRect(x, y, CELL, CELL);
          ctx.globalAlpha = heat[i];
          cellGlyph(i);
          heat[i] *= 0.94;
        } else {
          heat[i] = 0;
        }
      }
      ctx.globalAlpha = 1;
      if (busy && !raf) raf = requestAnimationFrame(draw);
    };

    const start = async () => {
      try {
        await img.decode();
        if (!build()) throw new Error('frame has no size');
      } catch {
        frame.classList.remove('decoding');
        return;
      }
      ready = true;
      begin = performance.now();
      frame.classList.remove('decoding');
      frame.classList.add('ready');
      if (intro) raf = requestAnimationFrame(draw);
    };
    start();

    /* ---- symbols under the pointer ---- */
    const move = (e: PointerEvent) => {
      if (!ready) return;
      const r = frame.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      for (let i = 0; i < heat.length; i++) {
        const dx = (i % cols) * CELL + CELL / 2 - px;
        const dy = Math.floor(i / cols) * CELL + CELL / 2 - py;
        const d = Math.hypot(dx, dy);
        if (d < LENS) heat[i] = Math.max(heat[i], 1 - d / LENS);
      }
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const fine = matchMedia('(pointer: fine)').matches;
    if (fine) frame.addEventListener('pointermove', move);

    const resize = () => {
      if (ready) build();
    };
    addEventListener('resize', resize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      if (fine) frame.removeEventListener('pointermove', move);
      removeEventListener('resize', resize);
    };
  });
</script>

<div class="frame" bind:this={frame}>
  <img bind:this={img} {src} {width} {height} {alt} decoding="async" />
  <canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>

<style>
  .frame {
    position: relative;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    border: 1.5px solid var(--rule);
    border-radius: var(--glass-radius);
    background: #141517;
    box-shadow: var(--shadow-hard);
  }

  img { width: 100%; height: 100%; object-fit: cover; }

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* Hidden only while script is on its way; this timer shows it regardless. */
  @media (prefers-reduced-motion: no-preference) {
    :global(.js) img { animation: photo-anyway 500ms ease-out 3.5s both; }
  }

  .frame:global(.decoding) img { animation: none; opacity: 0; }
  .frame:global(.ready) img { animation: none; opacity: 1; }

  @keyframes photo-anyway {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
</style>
