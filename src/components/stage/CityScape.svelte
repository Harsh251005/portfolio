<script lang="ts">
  /* ---------------------------------------------------------------
     Mumbai, after dark.

     Built from geometry, not illustration: three ranks of towers,
     each generated from a fixed seed so the skyline is the same city
     on every load. Ranks sit at different distances and move at
     different rates on scroll, which is where the depth comes from.

     Legibility is handled by composition rather than by dimming.
     The city occupies the lower part of the frame, because that is
     where a city is, and the text lives in the sky above it. That
     way the scene can be at full strength and still never sit under
     a paragraph.

     Cost: each rank is rendered once into an offscreen canvas at
     resize. A frame is then three drawImage calls plus a few dozen
     small rects for the windows that are currently flickering —
     which is what makes a scene this detailed affordable underneath
     a page full of backdrop-filters.
     --------------------------------------------------------------- */
  import { onMount } from 'svelte';
  import { rng } from '../../lib/motion/rng';
  import { mumbaiHour, skyFor } from '../../lib/motion/sky';

  interface Win {
    x: number;
    y: number;
    w: number;
    h: number;
    /** Which rank it belongs to. */
    rank: number;
    /** Seconds until it next changes state. */
    next: number;
    on: boolean;
  }

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let scroll = 0;

    /** Back to front. depth drives colour, scale and parallax rate.
     *
     *  `top` is the ground line and `height` the tower range, both as
     *  a share of viewport height. They are set so the crest of the
     *  skyline lands around 72% down: the text lives in the sky above
     *  it, which is how the scene can run at full strength without
     *  ever sitting under a paragraph. */
    const RANKS = [
      { depth: 0.18, rate: 0.04, top: 0.84, height: 0.12, width: 34, gap: 5, lit: 0.1 },
      { depth: 0.42, rate: 0.09, top: 0.92, height: 0.17, width: 52, gap: 8, lit: 0.16 },
      { depth: 1.0, rate: 0.17, top: 1.02, height: 0.24, width: 78, gap: 12, lit: 0.2 },
    ];

    /** Pools of city light thrown up into the sky. Read from the
     *  stylesheet so the palette stays in one place. */
    const GLOWS = [
      { x: 0.2, y: 0.86, r: 0.52, alpha: 0.3, color: '#22d3ee' },
      { x: 0.72, y: 0.9, r: 0.6, alpha: 0.26, color: '#7c5cff' },
      { x: 0.46, y: 0.96, r: 0.4, alpha: 0.2, color: '#f43f5e' },
    ];

    function readGlowColours() {
      const s = getComputedStyle(document.documentElement);
      const names = ['--light-1', '--light-2', '--light-3'];
      names.forEach((n, i) => {
        const v = s.getPropertyValue(n).trim();
        if (v) GLOWS[i].color = v;
      });
    }

    let layers: HTMLCanvasElement[] = [];
    let windows: Win[] = [];
    let stars: HTMLCanvasElement | null = null;
    let sky = skyFor(mumbaiHour());

    function buildStars() {
      const c = document.createElement('canvas');
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const g = c.getContext('2d')!;
      g.scale(dpr, dpr);
      const r = rng(9137);
      const count = Math.round((w * h) / 9000);
      for (let i = 0; i < count; i++) {
        const x = r() * w;
        // Only in the upper sky — no stars behind the skyline.
        const y = r() * h * 0.74;
        const a = 0.18 + r() * 0.62;
        const s = r() > 0.94 ? 1.6 : 1;
        g.globalAlpha = a;
        g.fillStyle = '#dfe7ff';
        g.fillRect(x, y, s, s);
      }
      return c;
    }

    function buildRank(index: number) {
      const rank = RANKS[index];
      const c = document.createElement('canvas');
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const g = c.getContext('2d')!;
      g.scale(dpr, dpr);

      const r = rng(4021 + index * 977);

      // Atmospheric perspective: distant ranks sit closer to the
      // haze colour, near ones closer to black.
      const silhouette = `color-mix(in oklab, ${sky.haze} ${Math.round(
        (1 - rank.depth) * 70,
      )}%, #04060e)`;
      g.fillStyle = silhouette;

      const baseY = h * rank.top;
      let x = -rank.width;

      while (x < w + rank.width) {
        const bw = rank.width * (0.55 + r() * 0.9);
        const bh = h * rank.height * (0.35 + r() * 0.95);
        const top = baseY - bh;

        g.fillRect(x, top, bw, h - top);

        // Occasional roof mast — the detail that stops a skyline
        // reading as a bar chart.
        if (r() > 0.78) {
          const mw = 2;
          const mh = bh * (0.08 + r() * 0.16);
          g.fillRect(x + bw / 2 - mw / 2, top - mh, mw, mh);
        }

        // Windows, on a grid inset from the edges.
        const cell = 7 + rank.depth * 5;
        const pad = 5;
        for (let wy = top + pad + 6; wy < h - pad; wy += cell) {
          for (let wx = x + pad; wx < x + bw - pad - 3; wx += cell) {
            if (r() > rank.lit) continue;
            const ww = Math.max(1.5, cell * 0.38);
            const wh = Math.max(1.5, cell * 0.3);
            // A small share of windows are animated; the rest are
            // baked into this canvas and never touched again.
            if (r() > 0.93) {
              windows.push({
                x: wx,
                y: wy,
                w: ww,
                h: wh,
                rank: index,
                next: r() * 9,
                on: r() > 0.4,
              });
            } else {
              g.globalAlpha = 0.25 + r() * 0.6;
              g.fillStyle = r() > 0.82 ? '#cfe3ff' : '#ffd9a0';
              g.fillRect(wx, wy, ww, wh);
              g.globalAlpha = 1;
              g.fillStyle = silhouette;
            }
          }
        }

        x += bw + rank.gap * (0.4 + r() * 1.4);
      }

      return c;
    }

    function build() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth;
      h = innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      readGlowColours();
      sky = skyFor(mumbaiHour());
      windows = [];
      stars = buildStars();
      layers = RANKS.map((_, i) => buildRank(i));
    }

    let lastT = 0;

    function frame(now: number) {
      if (!running) return;
      const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0;
      lastT = now;

      ctx.clearRect(0, 0, w, h);

      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, sky.high);
      grad.addColorStop(0.62, sky.low);
      grad.addColorStop(1, sky.low);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Light pollution: the colour a city throws into its own sky.
      // Folded in here rather than kept as a separate blurred DOM
      // layer, so it sits correctly *behind* the towers.
      for (const glow of GLOWS) {
        const g = ctx.createRadialGradient(
          w * glow.x,
          h * glow.y,
          0,
          w * glow.x,
          h * glow.y,
          Math.max(w, h) * glow.r,
        );
        g.addColorStop(0, glow.color);
        g.addColorStop(1, 'transparent');
        ctx.globalAlpha = glow.alpha;
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalAlpha = 1;

      if (stars && sky.stars > 0.02) {
        ctx.globalAlpha = sky.stars * 0.85;
        ctx.drawImage(stars, 0, -scroll * 0.02 * h, w, h);
        ctx.globalAlpha = 1;
      }

      // Haze sitting on the horizon, where a city's glow is.
      const haze = ctx.createLinearGradient(0, h * 0.62, 0, h);
      haze.addColorStop(0, 'transparent');
      haze.addColorStop(1, sky.haze);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = haze;
      ctx.fillRect(0, h * 0.62, w, h * 0.38);
      ctx.globalAlpha = 1;

      // Ranks, each drifting at its own rate.
      for (let i = 0; i < layers.length; i++) {
        ctx.drawImage(layers[i], 0, -scroll * RANKS[i].rate, w, h);
      }

      // The handful of windows that change.
      for (const win of windows) {
        win.next -= dt;
        if (win.next <= 0) {
          win.on = !win.on;
          win.next = 2 + Math.random() * 14;
        }
        if (!win.on) continue;
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#ffd9a0';
        ctx.fillRect(win.x, win.y - scroll * RANKS[win.rank].rate, win.w, win.h);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    }

    function onScroll() {
      scroll = scrollY;
    }

    function onVisibility() {
      running = !document.hidden;
      if (running) {
        lastT = 0;
        raf = requestAnimationFrame(frame);
      } else cancelAnimationFrame(raf);
    }

    build();
    onScroll();

    addEventListener('resize', build, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    if (reduced.matches) {
      // A still city. No flicker, no drift.
      frame(0);
      running = false;
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }

    // The sky should follow the clock for anyone leaving the tab open.
    const hourly = setInterval(() => {
      sky = skyFor(mumbaiHour());
    }, 60_000);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearInterval(hourly);
      removeEventListener('resize', build);
      removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  });
</script>

<div class="city" aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .city {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }

  canvas { display: block; }
</style>
