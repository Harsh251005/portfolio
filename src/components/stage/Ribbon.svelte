<script lang="ts">
  /* ---------------------------------------------------------------
     The ribbon.

     One thin line of light runs behind the whole page and takes the
     shape of whatever the reader is looking at. The point is that a
     visitor who knows nothing about AI can still read it: a wave
     that ripples like speech sits beside "it answers the phone", and
     the picture says the same thing as the words.

     Which shape it takes is decided by the page, not by this file.
     Any element can carry `data-form="voice"`; the ribbon looks at
     whatever sits under the middle of the window and uses the nearest
     ancestor that names a form. Nothing named means "calm". An
     element marked `data-quiet` (a stretch of bare text with no
     panel under it) fades the line down while it is under there. Adding a
     new shape is one function below plus one attribute in a template.

     Three strands share the shape with different phases and
     strengths, so it reads as one silk ribbon rather than a lone
     line. Rendered on a single canvas; a frame is ~1,000 points.

     Step 1 has two shapes: calm and voice.
     --------------------------------------------------------------- */
  import { onMount } from 'svelte';
  import { noise2 } from '../../lib/motion/noise';

  type Form = 'calm' | 'voice';

  /** Each shape returns a value in roughly -1..1 for a position
   *  along the ribbon (px), a time (s) and a strand (0..2). */
  const SHAPES: Record<Form, (x: number, t: number, k: number) => number> = {
    // Idle. A slow swell, barely there — something waiting.
    calm: (x, t, k) =>
      noise2(x * 0.0016 + k * 3.1, t * 0.12) * 0.9 + Math.sin(x * 0.004 + t * 0.5 + k * 0.9) * 0.25,

    // Speech. A travelling envelope (syllables) carrying a fast
    // oscillation, so loud and quiet stretches move along the line.
    voice: (x, t, k) => {
      const e = noise2(x * 0.0042 - t * 0.7, k * 7.3 + 11.7);
      const env = Math.pow(Math.min(1, Math.abs(e) * 2.2), 1.4);
      const carrier =
        Math.sin(x * 0.06 + t * 9 + k * 1.3) * 0.7 + Math.sin(x * 0.137 - t * 13 + k) * 0.3;
      return env * carrier;
    },
  };

  /** How tall each shape stands, as a share of window height. */
  const AMPLITUDE: Record<Form, number> = { calm: 0.024, voice: 0.085 };

  /** Strand strength, back to front: the echoes sit inside the lead. */
  const STRANDS = [1, 0.62, 0.36];

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const style = getComputedStyle(document.documentElement);
    const light = (name: string, fallback: string) =>
      style.getPropertyValue(name).trim() || fallback;
    const C1 = light('--light-1', '#22d3ee');
    const C2 = light('--light-2', '#7c5cff');
    const C3 = light('--light-3', '#f43f5e');

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    let last = 0;
    let clock = 0;

    /** 0 = calm, 1 = voice, eased so shapes melt into each other. */
    let target: Form = 'calm';
    let from: Form = 'calm';
    let mix = 1;

    /** Scroll speed, decaying. Makes the ribbon swell while you move. */
    let energy = 0;
    let lastY = scrollY;
    let heroness = 1;
    let probeAt = 0;
    /** 1 = full strength. Eases down over bare text with no panel. */
    let level = 1;
    let levelTarget = 1;

    const smooth = (x: number) => {
      const t = Math.min(1, Math.max(0, x));
      return t * t * (3 - 2 * t);
    };

    function hex(colour: string, alpha: number) {
      const c = colour.replace('#', '');
      const n = parseInt(c.length === 3 ? c.replace(/./g, '$&$&') : c, 16);
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
    }

    function build() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth;
      h = innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running || reduced.matches) draw();
    }

    /** Which shape is the page asking for, right now? */
    function probe() {
      const el = document.elementFromPoint(w / 2, h * 0.5);
      levelTarget = (el as HTMLElement | null)?.closest('[data-quiet]') ? 0.22 : 1;
      if (reduced.matches) level = levelTarget;
      const asked = (el as HTMLElement | null)?.closest<HTMLElement>('[data-form]')?.dataset.form;
      const next: Form = asked && asked in SHAPES ? (asked as Form) : 'calm';
      if (next !== target) {
        // Start the melt from whatever is on screen at this moment.
        from = mix > 0.5 ? target : from;
        target = next;
        mix = reduced.matches ? 1 : 0;
      }
    }

    function onScroll() {
      const dy = Math.abs(scrollY - lastY);
      lastY = scrollY;
      energy = Math.min(1.4, energy + dy * 0.004);
      heroness = 1 - smooth(scrollY / (innerHeight * 0.8));

      if (reduced.matches) {
        probe();
        draw();
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      const base = h * (0.5 + 0.37 * heroness);
      const swell = 1 + energy * 0.9;
      const m = smooth(mix);
      const aFrom = AMPLITUDE[from];
      const aTo = AMPLITUDE[target];
      const sFrom = SHAPES[from];
      const sTo = SHAPES[target];

      for (let k = STRANDS.length - 1; k >= 0; k--) {
        const strength = STRANDS[k];
        const path = new Path2D();

        for (let x = 0; x <= w + 3; x += 3) {
          // Both ends settle to a flat line, like a clip on a timeline.
          const edge = Math.pow(Math.sin(Math.PI * Math.min(1, x / w)), 0.55);
          const a = sFrom(x, clock, k) * aFrom * (1 - m) + sTo(x, clock, k) * aTo * m;
          const y = base + a * h * swell * strength * edge;
          if (x === 0) path.moveTo(x, y);
          else path.lineTo(x, y);
        }

        const g = ctx!.createLinearGradient(0, 0, w, 0);
        const alpha = (k === 0 ? 0.95 : k === 1 ? 0.55 : 0.3) * level;
        g.addColorStop(0, hex(C1, 0));
        g.addColorStop(0.14, hex(C1, alpha));
        g.addColorStop(0.5, hex(C2, alpha));
        g.addColorStop(0.86, hex(C3, alpha));
        g.addColorStop(1, hex(C3, 0));

        ctx!.lineJoin = 'round';
        ctx!.lineCap = 'round';
        // A wide faint stroke under a fine bright one is the glow.
        ctx!.strokeStyle = g;
        ctx!.globalAlpha = 0.1 * level;
        ctx!.lineWidth = 8;
        ctx!.stroke(path);
        ctx!.globalAlpha = 1;
        ctx!.lineWidth = k === 0 ? 1.6 : 1.1;
        ctx!.stroke(path);
      }
    }

    function frame(now: number) {
      if (!running) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      clock += dt;

      energy *= Math.exp(-dt * 2.4);
      mix = Math.min(1, mix + dt * 0.9);
      level += (levelTarget - level) * (1 - Math.exp(-dt * 4));
      if (now - probeAt > 120) {
        probeAt = now;
        probe();
      }

      draw();
      raf = requestAnimationFrame(frame);
    }

    function onVisibility() {
      running = !document.hidden && !reduced.matches;
      if (running) {
        last = 0;
        raf = requestAnimationFrame(frame);
      } else cancelAnimationFrame(raf);
    }

    build();
    onScroll();

    addEventListener('resize', build, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    if (reduced.matches) {
      // One still frame per place you scroll to. No travel, no swell.
      running = false;
      clock = 3;
      probe();
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      removeEventListener('resize', build);
      removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  });
</script>

<div class="ribbon" aria-hidden="true">
  <!-- Three soft pools of colour, so the glass has light to refract
       and the line has somewhere to sit. Static: the motion is the line. -->
  <div class="pools"></div>
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .ribbon {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .pools {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(60% 50% at 10% 6%,
        color-mix(in oklab, var(--light-1) 17%, transparent), transparent 70%),
      radial-gradient(55% 50% at 94% 42%,
        color-mix(in oklab, var(--light-2) 19%, transparent), transparent 70%),
      radial-gradient(60% 50% at 28% 102%,
        color-mix(in oklab, var(--light-3) 13%, transparent), transparent 70%);
  }

  canvas { position: absolute; inset: 0; display: block; }
</style>
