/* ---------------------------------------------------------------
   The hero name as a solid block.

   The depth is a stack of text shadows, dark night-blue, stepping away
   from the face. The block tilts toward the pointer, and its sides turn
   with it: as it tilts, the side facing away from you shows more. The
   light comes from the moon's side (top right), so sides that face it
   catch a little light and the face brightens a touch as it turns that
   way. On a touch screen it sways slowly on its own.

   The letters standing up one by one is a CSS animation in Hero.svelte;
   this file only grows the depth in step with it and runs the tilt.
   With reduced motion the block is painted once, at rest.
   --------------------------------------------------------------- */

const LAYERS = 16;
const NEAR = [74, 86, 124];
const FAR = [8, 12, 28];
const FACE_DIM = [150, 158, 182];
const FACE_LIT = [245, 242, 232];

const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export interface SolidOptions {
  /** How long the depth takes to grow in, ms (the letters' entrance). */
  growMs: number;
  /** When the growing starts, ms after mount. */
  growDelay: number;
  /** The element whose pointer movement steers the tilt. */
  area: HTMLElement;
}

export function solidName(el: HTMLElement, { growMs, growDelay, area }: SolidOptions) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  /** Tilt in degrees; depth 0..1. */
  const paint = (rx: number, ry: number, depth: number) => {
    el.style.transform = rx || ry ? `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)` : '';
    const dx = (-0.32 - ry / 30) * depth;
    const dy = (0.38 + rx / 30) * depth;
    const em = parseFloat(getComputedStyle(el).fontSize) / 100;
    const lit = Math.max(0, 0.18 - dx * 0.12 - dy * 0.12);
    const sh: string[] = [];
    for (let k = 1; k <= LAYERS; k++) {
      const c = mix(NEAR, FAR, Math.min(1, (k / LAYERS) * 0.85 + 0.1 - lit));
      sh.push(`${(dx * k * em).toFixed(2)}px ${(dy * k * em).toFixed(2)}px 0 rgb(${c.join(',')})`);
    }
    sh.push(`${(dx * LAYERS * em * 1.6).toFixed(1)}px ${(dy * LAYERS * em * 1.9).toFixed(1)}px ${(18 * em).toFixed(1)}px rgba(0,0,0,${(0.45 * depth).toFixed(2)})`);
    el.style.textShadow = sh.join(',');
    el.style.color = `rgb(${mix(FACE_DIM, FACE_LIT, 0.9 + clamp((ry - rx) / 120, -0.1, 0.1)).join(',')})`;
  };

  if (still) {
    paint(0, 0, 1);
    return () => {};
  }

  const t0 = performance.now();
  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  let pointer = false;
  let visible = true;
  let raf = 0;
  let last = 0;
  let painted = { x: NaN, y: NaN, d: NaN };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    // Phones run it at 30 fps; the sea already keeps the GPU busy.
    if (coarse && now - last < 33) return;
    last = now;
    if (!visible) return;
    const t = (now - t0) / 1000;
    const depth = clamp((now - t0 - growDelay) / growMs, 0, 1);
    if (!pointer) {
      // Sway: only after the letters are up, easing in from still.
      const sway = clamp((now - t0 - growDelay - growMs) / 1500, 0, 1);
      target.x = Math.sin(t * 0.45) * 5 * sway;
      target.y = Math.sin(t * 0.3) * 9 * sway;
    }
    cur.x += (target.x - cur.x) * 0.07;
    cur.y += (target.y - cur.y) * 0.07;
    // Skip the repaint when nothing visible changed.
    if (Math.abs(cur.x - painted.x) < 0.02 && Math.abs(cur.y - painted.y) < 0.02 && depth === painted.d) return;
    paint(cur.x, cur.y, depth);
    painted = { x: cur.x, y: cur.y, d: depth };
  };
  raf = requestAnimationFrame(frame);

  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    pointer = true;
    const r = el.getBoundingClientRect();
    target.x = (-(e.clientY - (r.top + r.height / 2)) / innerHeight) * 22;
    target.y = ((e.clientX - (r.left + r.width / 2)) / innerWidth) * 28;
  };
  const leave = () => (pointer = false);
  area.addEventListener('pointermove', move);
  area.addEventListener('pointerleave', leave);

  // Nothing to paint while the hero is scrolled away.
  const seen = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  seen.observe(el);

  return () => {
    cancelAnimationFrame(raf);
    seen.disconnect();
    area.removeEventListener('pointermove', move);
    area.removeEventListener('pointerleave', leave);
  };
}
