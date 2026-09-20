<script lang="ts">
  /* ---------------------------------------------------------------
     Mumbai, after dark.

     Built from geometry, not illustration: three ranks of towers,
     each generated from a fixed seed so the skyline is the same city
     on every load. Ranks sit at different distances and drift at
     different rates on scroll, which is where the depth comes from.

     Legibility is handled by composition rather than by dimming.
     The city occupies the lower part of the frame, because that is
     where a city is, and the text lives in the sky above it. That
     way the scene can be at full strength and still never sit under
     a paragraph.

     Cost: each rank is rendered once into an offscreen canvas at
     resize — including its window bloom, which is the expensive part
     and is therefore paid exactly once. A frame is then three
     drawImage calls plus a few dozen small rects for the lights that
     are currently changing, which is what makes a scene this detailed
     affordable underneath a page full of backdrop-filters.
     --------------------------------------------------------------- */
  import { onMount } from 'svelte';
  import { rng } from '../../lib/motion/rng';
  import { mumbaiHour, skyFor, blend } from '../../lib/motion/sky';

  /** A window that changes state while you watch. */
  interface Win {
    x: number;
    y: number;
    w: number;
    h: number;
    rank: number;
    colour: string;
    /** Seconds until it next changes state. */
    next: number;
    on: boolean;
  }

  /** A red aircraft-warning light on a rooftop mast. */
  interface Beacon {
    x: number;
    y: number;
    rank: number;
    /** Offset into the blink cycle, so they never pulse in unison. */
    phase: number;
    period: number;
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

    /** Scroll progress through the whole document, 0–1.
     *
     *  Parallax is driven by this rather than by raw `scrollY`, and
     *  that distinction is the whole ball game: an unbounded offset
     *  eventually slides the towers clean off their own ground line
     *  and fills the viewport with silhouette. Bounded to the page,
     *  each rank travels a fixed, small number of pixels no matter
     *  how long the page becomes. */
    let progress = 0;

    /** Slack drawn below the viewport in every rank canvas, so that
     *  drifting one downward never exposes a transparent edge. Must
     *  exceed the largest `drift` below. */
    const PAD = 180;

    /** Back to front. `depth` drives colour, detail and drift.
     *
     *  `top` is the ground line and `height` the tower range, both as
     *  a share of viewport height. They are set so the crest of the
     *  skyline lands around 72% down: the text lives in the sky above
     *  it, which is how the scene can run at full strength without
     *  ever sitting under a paragraph.
     *
     *  `drift` is the total travel across the entire page, in pixels.
     *  Near ranks move further than far ones — that difference is the
     *  parallax. The city settles downward as you descend the page,
     *  which keeps the lower sections clearer than lifting it would. */
    const RANKS = [
      { depth: 0.18, drift: 22, top: 0.84, height: 0.12, width: 30, gap: 4 },
      { depth: 0.5, drift: 64, top: 0.93, height: 0.18, width: 46, gap: 7 },
      { depth: 1.0, drift: 130, top: 1.04, height: 0.26, width: 74, gap: 11 },
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
    let beacons: Beacon[] = [];
    let stars: HTMLCanvasElement | null = null;
    let sky = skyFor(mumbaiHour());

    const WARM = '#ffd7a0';
    const COOL = '#cfe1ff';

    /** How far rank `i` has drifted at the current scroll position. */
    const driftOf = (i: number) => RANKS[i].drift * progress;

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
        const y = r() * h * 0.7;
        const a = 0.18 + r() * 0.62;
        const s = r() > 0.94 ? 1.6 : 1;
        g.globalAlpha = a;
        g.fillStyle = '#dfe7ff';
        g.fillRect(x, y, s, s);
      }
      return c;
    }

    /* --- The towers -------------------------------------------------

       What separates a skyline from a bar chart is almost entirely in
       the roofline and in how the windows are lit. Real buildings
       taper, step back, and carry clutter — tanks, lift housings,
       masts. And their windows are not random noise: they sit on
       floors, in columns, and they light up in patterns, because a
       stairwell is lit all night and an office floor is lit or dark
       as a whole.
       ---------------------------------------------------------------- */

    function buildRank(index: number) {
      const rank = RANKS[index];
      const c = document.createElement('canvas');
      c.width = Math.round(w * dpr);
      c.height = Math.round((h + PAD) * dpr);
      const g = c.getContext('2d')!;
      g.scale(dpr, dpr);

      const r = rng(4021 + index * 977);
      const floor = h + PAD;

      // Atmospheric perspective: distant ranks sit closer to the haze
      // colour, near ones closer to black.
      const body = blend('#04060e', sky.haze, (1 - rank.depth) * 0.62);
      // The face turned toward the city's own glow catches a little
      // of it. One lit edge per tower is what gives the silhouette
      // volume instead of reading as a cut-out.
      const edge = blend(body, sky.haze, 0.45);
      const near = rank.depth > 0.7;

      const baseY = h * rank.top;
      const range = h * rank.height;
      let x = -rank.width;

      while (x < w + rank.width) {
        const bw = rank.width * (0.5 + r() * 1.05);
        // Most of a real skyline is mid-rise with a few towers
        // standing out of it, so the tall end is a long tail rather
        // than an even spread.
        const bh = range * (0.28 + Math.pow(r(), 2.1) * 1.12);
        const top = baseY - bh;
        const tall = bh > range * 0.75;

        g.fillStyle = body;
        g.fillRect(x, top, bw, floor - top);

        // Lit edge, on the side facing the middle of the frame.
        const fromLeft = x + bw / 2 < w / 2;
        g.fillStyle = edge;
        g.fillRect(fromLeft ? x + bw - 1.5 : x, top, 1.5, floor - top);

        // Parapet: a roofline is never a bare cut. A 2px lip that
        // overhangs slightly is the cheapest possible read of one.
        g.fillRect(x - 1, top, bw + 2, 2);

        /* Crown. */
        const crown = r();
        let roofY = top;
        let roofX = x;
        let roofW = bw;

        if (crown > 0.55 && crown < 0.8) {
          // Setback — a narrower block stacked on the base. Two of
          // them for the taller ones.
          const steps = crown > 0.72 ? 2 : 1;
          for (let s = 0; s < steps; s++) {
            const sw = roofW * (0.5 + r() * 0.28);
            const sh = bh * (0.08 + r() * 0.14);
            roofX = roofX + (roofW - sw) * (0.25 + r() * 0.5);
            roofW = sw;
            roofY -= sh;
            g.fillStyle = body;
            g.fillRect(roofX, roofY, roofW, sh + 2);
            g.fillStyle = edge;
            g.fillRect(roofX - 1, roofY, roofW + 2, 1.5);
          }
        } else if (crown > 0.8 && !tall) {
          // Tapered crown, for the older stock.
          g.fillStyle = body;
          g.beginPath();
          g.moveTo(roofX, roofY + 1);
          g.lineTo(roofX + roofW / 2, roofY - bh * 0.1);
          g.lineTo(roofX + roofW, roofY + 1);
          g.closePath();
          g.fill();
          roofY -= bh * 0.1;
        }

        // Rooftop clutter — water tanks and lift housings. This is
        // the single most Mumbai detail available for two rects.
        if (rank.depth > 0.35 && r() > 0.42) {
          const boxes = 1 + Math.floor(r() * 2);
          g.fillStyle = body;
          for (let b = 0; b < boxes; b++) {
            const cw = roofW * (0.14 + r() * 0.2);
            const ch = 3 + r() * (near ? 8 : 4);
            const cx = roofX + r() * Math.max(0, roofW - cw);
            g.fillRect(cx, roofY - ch, cw, ch);
            // Tank legs.
            if (near && r() > 0.6) {
              g.fillRect(cx + 1, roofY - ch - 3, 1.5, 3);
              g.fillRect(cx + cw - 2.5, roofY - ch - 3, 1.5, 3);
              g.fillRect(cx, roofY - ch - 6, cw, 3);
            }
          }
        }

        // Mast, on the tall ones, with a warning light at the top.
        if (tall || r() > 0.86) {
          const mh = Math.min(bh * (0.1 + r() * 0.2), 10 + rank.depth * 16);
          const mx = roofX + roofW / 2;
          g.fillStyle = edge;
          g.fillRect(mx - 1, roofY - mh, 2, mh);
          if (tall) {
            beacons.push({
              x: mx,
              y: roofY - mh,
              rank: index,
              phase: r() * 4,
              period: 2 + r() * 1.6,
            });
          }
        }

        /* Windows.
           A per-building lighting model rather than per-window noise:
           one lamp temperature for the whole block, a baseline
           occupancy, sometimes a stairwell column lit top to bottom,
           sometimes a whole floor. */
        const floorH = 5 + rank.depth * 6;
        const colW = 4 + rank.depth * 5;
        const inset = Math.max(2, bw * 0.07);
        const cols = Math.floor((bw - inset * 2) / colW);
        const rows = Math.floor((bh - 6) / floorH);

        if (cols >= 1 && rows >= 1) {
          const warm = r() > 0.28;
          const colour = warm ? WARM : COOL;
          const occupancy = 0.1 + r() * 0.42;
          const stair = r() > 0.6 ? Math.floor(r() * cols) : -1;
          const litFloor = r() > 0.72 ? Math.floor(r() * rows) : -1;
          const ww = Math.max(1.2, colW * 0.44);
          const wh = Math.max(1.2, floorH * 0.36);

          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              let p = occupancy;
              if (col === stair) p = 0.88;
              if (row === litFloor) p = 0.8;
              if (r() > p) continue;

              const wx = x + inset + col * colW;
              const wy = top + 5 + row * floorH;
              const alpha = 0.3 + r() * 0.6;

              // A small share change while you watch; the rest are
              // baked here and never touched again.
              if (r() > 0.955) {
                windows.push({
                  x: wx,
                  y: wy,
                  w: ww,
                  h: wh,
                  rank: index,
                  colour,
                  next: r() * 9,
                  on: r() > 0.4,
                });
                continue;
              }

              // Bloom, on the brightest windows of the near ranks
              // only — the halo a lit window has through humid air.
              if (near && alpha > 0.72) {
                g.shadowColor = colour;
                g.shadowBlur = 4;
              }
              g.globalAlpha = alpha;
              g.fillStyle = colour;
              g.fillRect(wx, wy, ww, wh);
              g.shadowBlur = 0;
              g.globalAlpha = 1;
            }
          }
        }

        x += bw + rank.gap * (0.3 + r() * 1.5);
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
      beacons = [];
      stars = buildStars();
      layers = RANKS.map((_, i) => buildRank(i));
    }

    /** Haze drawn *between* the ranks, not just once behind them.
     *  Separating the layers with air is what reads as distance. */
    function drawHaze(strength: number) {
      const grad = ctx.createLinearGradient(0, h * 0.52, 0, h);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, sky.haze);
      ctx.globalAlpha = strength;
      ctx.fillStyle = grad;
      ctx.fillRect(0, h * 0.52, w, h * 0.48);
      ctx.globalAlpha = 1;
    }

    let lastT = 0;
    let clock = 0;

    function frame(now: number) {
      const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0;
      lastT = now;
      clock += dt;

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
        ctx.drawImage(stars, 0, progress * 10, w, h);
        ctx.globalAlpha = 1;
      }

      drawPlane();

      // Ranks, back to front, each separated by a little air.
      for (let i = 0; i < layers.length; i++) {
        drawHaze(0.3 - i * 0.07);
        ctx.drawImage(layers[i], 0, driftOf(i), w, h + PAD);
      }

      // The handful of windows that change.
      for (const win of windows) {
        win.next -= dt;
        if (win.next <= 0) {
          win.on = !win.on;
          win.next = 2 + Math.random() * 14;
        }
        if (!win.on) continue;
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = win.colour;
        ctx.fillRect(win.x, win.y + driftOf(win.rank), win.w, win.h);
      }
      ctx.globalAlpha = 1;

      drawBeacons();

      if (running) raf = requestAnimationFrame(frame);
    }

    /** Red aircraft-warning lights. Every tall building in the city
     *  has one, and nothing else says "this is a real skyline at
     *  night" for so little drawing. */
    function drawBeacons() {
      for (const b of beacons) {
        const t = (clock + b.phase) % b.period;
        if (t > 0.42) continue;
        const k = Math.sin((t / 0.42) * Math.PI);
        const y = b.y + driftOf(b.rank);
        const g = ctx.createRadialGradient(b.x, y, 0, b.x, y, 7);
        g.addColorStop(0, 'rgba(255,72,72,0.9)');
        g.addColorStop(1, 'rgba(255,72,72,0)');
        ctx.globalAlpha = k;
        ctx.fillStyle = g;
        ctx.fillRect(b.x - 8, y - 8, 16, 16);
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(b.x - 1, y - 1, 2, 2);
        ctx.globalAlpha = 1;
      }
    }

    /** One aircraft on approach, every so often. Mumbai sits under a
     *  flight path; this is the quiet detail that rewards anyone who
     *  actually stops and looks at the scene. */
    const PLANE_CYCLE = 70;
    const PLANE_CROSS = 34;

    function drawPlane() {
      const t = clock % PLANE_CYCLE;
      if (t > PLANE_CROSS) return;
      const k = t / PLANE_CROSS;
      const pass = Math.floor(clock / PLANE_CYCLE);
      const dir = pass % 2 === 0 ? 1 : -1;
      const x = dir === 1 ? -0.06 * w + k * w * 1.12 : w * 1.06 - k * w * 1.12;
      const y = h * (0.16 + ((pass * 0.37) % 1) * 0.22) - k * h * 0.02;

      // Fade in and out at the edges so it never pops.
      const fade = Math.min(1, Math.min(k, 1 - k) * 8);
      ctx.globalAlpha = 0.5 * fade;
      ctx.fillStyle = '#e8eeff';
      ctx.fillRect(x, y, 1.6, 1.6);
      const blink = clock % 1.3 < 0.16;
      if (blink) {
        ctx.globalAlpha = 0.8 * fade;
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(x - dir * 3, y + 0.5, 1.6, 1.6);
      }
      ctx.globalAlpha = 1;
    }

    function onScroll() {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
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
      // A still city. No flicker, no drift, no blinking.
      running = false;
      frame(0);
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
