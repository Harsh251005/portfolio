/* ---------------------------------------------------------------
   Gradient noise, ~40 lines, no dependency.

   The flow field needs a smooth, continuous, repeatable vector at
   any point in space and time. A noise library would be 30KB for
   this one function.
   --------------------------------------------------------------- */

const P = new Uint8Array(512);

(function seed() {
  const perm = new Uint8Array(256);
  for (let i = 0; i < 256; i++) perm[i] = i;

  // Deterministic shuffle: the field looks identical on every load,
  // so the site has a fixed visual signature rather than a random one.
  let s = 1337;
  for (let i = 255; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 512; i++) P[i] = perm[i & 255];
})();

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function grad(hash: number, x: number, y: number): number {
  switch (hash & 3) {
    case 0: return x + y;
    case 1: return -x + y;
    case 2: return x - y;
    default: return -x - y;
  }
}

/** Perlin noise in 2D. Returns roughly -1..1. */
export function noise2(x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = fade(xf);
  const v = fade(yf);

  const aa = P[P[xi] + yi];
  const ab = P[P[xi] + yi + 1];
  const ba = P[P[xi + 1] + yi];
  const bb = P[P[xi + 1] + yi + 1];

  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v,
  );
}

/** Two octaves. Enough structure to look organised, cheap enough to
 *  run per-particle per-frame. */
export function fbm(x: number, y: number): number {
  return noise2(x, y) * 0.65 + noise2(x * 2.3, y * 2.3) * 0.35;
}
