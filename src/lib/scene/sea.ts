/* ---------------------------------------------------------------
   The moonlit sea behind the whole site.

   Two layers. The water is a WebGL fragment shader: each pixel works out
   where its ray meets the sea, how the waves tilt the surface there, and
   what that surface reflects, so the moon's path appears on its own from
   the physics. The sky is a 2D canvas on top of it: gradient, moon, stars,
   clouds, a boat and the odd shooting star.

   All colours live in NIGHT, so a later time-of-day version only has to
   supply another palette. Scrolling never changes the scene.
   --------------------------------------------------------------- */

type RGB = [number, number, number];

export interface Palette {
  /** Sky, top to horizon. */
  sky: RGB[];
  /** The water's own colour, seen looking straight down. */
  deep: RGB;
  moon: RGB;
}

export const NIGHT: Palette = {
  sky: [[4, 7, 18], [9, 16, 34], [20, 32, 58], [40, 54, 84]],
  deep: [2, 7, 15],
  moon: [255, 246, 224],
};

/** Horizon height, as a share of the screen from the top. */
const HORIZON = 0.62;

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const css = (c: RGB, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

/** The sky's stars, shared so other parts of the page can borrow some of
 *  them: a borrowed star is skipped here and drawn by its borrower instead. */
export interface Star { x: number; y: number; s: number; ph: number; sp: number }
export const skyBridge = {
  stars: [] as Star[],
  hz: 0,
  version: 0,
  taken: new Set<number>(),
};

/** Where the moon sits, in screen pixels. On a phone the hero text fills the
 *  middle of the screen, so the moon goes up into the empty sky above it. */
function moonSpot(w: number, h: number) {
  const narrow = w < h;
  return { x: w * (narrow ? 0.78 : 0.885), y: h * HORIZON * (narrow ? 0.2 : 0.42), r: Math.min(w, h) * (narrow ? 0.075 : 0.062) };
}

/* ---------- the water ---------- */

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;      // the water's size in pixels
uniform float uScreenH; // the full screen's height, same scale
uniform float uTime;
uniform vec3 uMoon;     // direction to the moon
uniform vec3 uHorizon;
uniform vec3 uZenith;
uniform vec3 uDeep;
uniform vec3 uMoonCol;
uniform float uGlow;    // 0-1: the moon brightens when the cursor is near it

const float FOCAL = 1.05;
const float CAM = 3.0;

// Sharp-crested waves: each is exp(sin) along a direction, and each one's
// slope nudges the next, which bunches them up the way real swell does.
vec2 slopes(vec2 p, float dist) {
  vec2 total = vec2(0.);
  float amp = 1.0, freq = 0.34, speed = 0.62, angle = 0.4, weight = 0.;
  vec2 pos = p;
  for (int i = 0; i < 16; i++) {
    // High frequencies fade out with distance, where they would only flicker.
    float fade = smoothstep(1.0, 0.25, freq * dist * 0.012);
    vec2 d = vec2(cos(angle), sin(angle));
    float u = dot(d, pos) * freq + uTime * speed;
    float e = exp(sin(u) - 1.0);
    vec2 s = d * e * cos(u) * freq * amp;
    total += s * fade;
    pos -= s * 0.09 / max(freq, 0.1);
    weight += amp;
    amp *= 0.8;
    freq *= 1.2;
    speed *= 1.07;
    angle += 2.399;
  }
  return total / weight;
}

vec3 skyAt(vec3 r) {
  return mix(uHorizon, uZenith, pow(clamp(r.y, 0., 1.), 0.45));
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec3 dir = normalize(vec3((px.x - uRes.x * 0.5) / uScreenH, (px.y - uRes.y) / uScreenH - 0.0015, FOCAL));

  float t = CAM / -dir.y;
  vec2 p = dir.xz * t;

  vec2 s = slopes(p, t) * 2.6;
  // Far water is seen so edge-on that its detail averages out.
  float flat_ = smoothstep(10., 150., t);
  vec3 n = normalize(vec3(-s.x, 1.0 + flat_ * 2.2, -s.y));

  vec3 r = reflect(dir, n);
  r.y = abs(r.y);

  float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, -dir), 0.), 5.0);
  vec3 col = mix(uDeep, skyAt(r), fres);

  // Light scattering inside the wave faces that turn toward the moon.
  col += uDeep * 2.2 * clamp(dot(n, normalize(vec3(uMoon.x, 0.5, uMoon.z))) - 0.42, 0., 1.);

  // The moon: a wide soft sheen and tight glitter on top of it.
  float m = max(dot(r, uMoon), 0.);
  col += uMoonCol * (pow(m, 90.) * 0.22 + pow(m, 700.) * 0.9 + pow(m, 4000.) * 1.6) * (1. + uGlow * 0.7);

  // Distance melts into the horizon, with no hard line.
  col = mix(uHorizon, col, exp(-t * 0.0052));

  gl_FragColor = vec4(col, 1.);
}`;

function makeWater(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const uTime = u('uTime');
  const uMoon = u('uMoon');
  const uGlow = u('uGlow');
  const vec = (c: RGB) => [(c[0] / 255) ** 2.2, (c[1] / 255) ** 2.2, (c[2] / 255) ** 2.2].map((v) => v ** (1 / 2.2));

  return {
    size(w: number, h: number, screenH: number, palette: Palette) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u('uRes'), w, h);
      gl.uniform1f(u('uScreenH'), screenH);
      gl.uniform3fv(u('uHorizon'), vec(palette.sky[3]));
      gl.uniform3fv(u('uZenith'), vec(palette.sky[1]));
      gl.uniform3fv(u('uDeep'), vec(palette.deep));
      gl.uniform3fv(u('uMoonCol'), vec(palette.moon));
    },
    draw(time: number, moon: [number, number, number], glow: number) {
      gl.uniform1f(uTime, time);
      gl.uniform1f(uGlow, glow);
      gl.uniform3fv(uMoon, moon);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}

/* ---------- the moon: limb shading, dark seas, craters ---------- */

function makeFbm(seed: number) {
  const r = rng(seed);
  const table = Array.from({ length: 65536 }, () => r());
  const at = (a: number, b: number) => table[((a & 255) << 8) | (b & 255)];
  const n = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    return (at(xi, yi) * (1 - u) + at(xi + 1, yi) * u) * (1 - v) + (at(xi, yi + 1) * (1 - u) + at(xi + 1, yi + 1) * u) * v;
  };
  return (x: number, y: number, octaves = 5) => {
    let v = 0, a = 1, t = 0;
    for (let o = 0; o < octaves; o++) {
      v += n(x + o * 19.1, y + o * 7.7) * a;
      t += a;
      a *= 0.5;
      x *= 2.03;
      y *= 2.03;
    }
    return v / t;
  };
}

function makeMoon(radius: number) {
  const size = Math.ceil(radius * 2 + 4);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const x = c.getContext('2d')!;
  const img = x.createImageData(size, size);
  const fbm = makeFbm(5);
  const r = rng(77);
  const craters = Array.from({ length: 34 }, () => {
    const a = r() * 6.283, d = Math.sqrt(r()) * 0.92;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d, r: 0.025 + r() * r() * 0.13 };
  });
  const mid = size / 2;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const nx = (px + 0.5 - mid) / radius;
      const ny = (py + 0.5 - mid) / radius;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1.03) continue;
      const z = Math.sqrt(Math.max(0, 1 - d2));
      let b = 0.62 + 0.38 * Math.pow(z, 0.55);
      // The dark seas, weighted to the upper left like the real one.
      const sea = smooth(0.47, 0.6, fbm(nx * 1.9 + 3, ny * 1.9 + 8) + (-nx - ny) * 0.07);
      b *= 1 - sea * 0.3;
      b *= 0.93 + 0.14 * fbm(nx * 9, ny * 9, 4);
      for (const k of craters) {
        const dx = (nx - k.x) / k.r, dy = (ny - k.y) / k.r;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 1.25) continue;
        const lit = (dx + dy) * 0.7; // Light from the upper left.
        if (d < 1) b *= 1 - 0.12 * (1 - d) + lit * 0.08 * d;
        else b *= 1 - lit * 0.4 * (1.25 - d);
      }
      const i = (py * size + px) * 4;
      img.data[i] = 246 * b;
      img.data[i + 1] = 240 * b;
      img.data[i + 2] = 222 * b;
      img.data[i + 3] = 255 * clamp((1 - Math.sqrt(d2)) * radius + 0.5);
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}

function makeCloud(w: number, h: number, seed: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  const img = x.createImageData(w, h);
  const fbm = makeFbm(seed);
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const ex = Math.sin((px / w) * Math.PI);
      const ey = Math.sin((py / h) * Math.PI);
      const i = (py * w + px) * 4;
      img.data[i] = 150;
      img.data[i + 1] = 164;
      img.data[i + 2] = 194;
      img.data[i + 3] = 255 * smooth(0.42, 0.72, fbm(px * 0.011, py * 0.05)) * ex * ey;
    }
  }
  x.putImageData(img, 0, 0);
  return c;
}

/* ---------- the sky ---------- */

function makeSky(canvas: HTMLCanvasElement, w: number, h: number, palette: Palette) {
  const ctx = canvas.getContext('2d')!;
  const hz = h * HORIZON;
  const r = rng(19);
  const spot = moonSpot(w, h);

  const backdrop = document.createElement('canvas');
  backdrop.width = w;
  backdrop.height = Math.ceil(hz);
  const b = backdrop.getContext('2d')!;
  const g = b.createLinearGradient(0, 0, 0, hz);
  palette.sky.forEach((c, i) => g.addColorStop(i / (palette.sky.length - 1), css(c)));
  b.fillStyle = g;
  b.fillRect(0, 0, w, hz);
  const halo = b.createRadialGradient(spot.x, spot.y, spot.r * 0.8, spot.x, spot.y, spot.r * 5.5);
  halo.addColorStop(0, 'rgba(190,202,230,0.34)');
  halo.addColorStop(0.35, 'rgba(150,170,210,0.1)');
  halo.addColorStop(1, 'rgba(150,170,210,0)');
  b.fillStyle = halo;
  b.fillRect(0, 0, w, hz);

  const area = (w * hz) / 400000;
  const stars = Array.from({ length: Math.round(360 * area) }, () => ({
    x: r() * w, y: r() * hz, s: 0.5 + r() * r() * 1.7, ph: r() * 6.28, sp: 0.4 + r() * 1.4,
  }));
  skyBridge.stars = stars;
  skyBridge.hz = hz;
  skyBridge.version++;
  skyBridge.taken = new Set();
  const moon = makeMoon(spot.r);
  const clouds = Array.from({ length: 5 }, (_, i) => {
    const cw = 520 + (i % 3) * 170;
    return { img: makeCloud(cw, 90 + (i % 2) * 44, 31 + i * 9), w: cw, y: hz * (0.08 + r() * 0.62), x: r() * (w + cw), v: 4 + r() * 7, a: 0.32 + r() * 0.34 };
  });

  let shooting: { x: number; y: number; vx: number; vy: number; t: number } | null = null;
  let nextShot = 6000;
  let last = 0;

  return (now: number, moonGlow = 0) => {
    const dt = Math.min(100, now - last || 16);
    last = now;
    const t = now * 0.001;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(backdrop, 0, 0);

    ctx.fillStyle = '#e6efff';
    const taken = skyBridge.taken;
    for (let i = 0; i < stars.length; i++) {
      if (taken.has(i)) continue;
      const s = stars[i];
      ctx.globalAlpha = 0.4 + 0.6 * Math.sin(t * s.sp + s.ph) ** 2;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }
    ctx.globalAlpha = 1;

    nextShot -= dt;
    if (nextShot <= 0) {
      nextShot = 9000 + Math.random() * 11000;
      shooting = {
        x: w * (0.15 + Math.random() * 0.7),
        y: hz * (0.05 + Math.random() * 0.3),
        vx: (Math.random() > 0.5 ? 1 : -1) * w * 0.0007,
        vy: hz * 0.0006,
        t: 0,
      };
    }
    if (shooting) {
      shooting.t += dt;
      const k = shooting.t / 800;
      if (k >= 1) {
        shooting = null;
      } else {
        const hx = shooting.x + shooting.vx * shooting.t;
        const hy = shooting.y + shooting.vy * shooting.t;
        const tail = ctx.createLinearGradient(hx, hy, hx - shooting.vx * 170, hy - shooting.vy * 170);
        tail.addColorStop(0, `rgba(255,255,255,${Math.sin(k * Math.PI)})`);
        tail.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = tail;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx - shooting.vx * 170, hy - shooting.vy * 170);
        ctx.stroke();
      }
    }

    if (moonGlow > 0.01) {
      // The moon brightens a little when the cursor is on it.
      const lit = ctx.createRadialGradient(spot.x, spot.y, spot.r * 0.8, spot.x, spot.y, spot.r * 4.2);
      lit.addColorStop(0, `rgba(255,240,208,${0.3 * moonGlow})`);
      lit.addColorStop(1, 'rgba(255,240,208,0)');
      ctx.fillStyle = lit;
      ctx.fillRect(spot.x - spot.r * 4.2, spot.y - spot.r * 4.2, spot.r * 8.4, spot.r * 8.4);
    }
    ctx.drawImage(moon, spot.x - moon.width / 2, spot.y - moon.height / 2);

    for (const c of clouds) {
      ctx.globalAlpha = c.a;
      ctx.drawImage(c.img, ((c.x + t * c.v) % (w + c.w)) - c.w, c.y);
    }
    ctx.globalAlpha = 1;

    /* ---- a small sailboat, out on the water, under way ---- */
    const scale = Math.min(1, w / 1100) * 0.45 + 0.55;
    const span = w + 240;
    // Heading left at an easy drift, and round again. The speed follows the
    // boat's size, so on a small screen it doesn't race across.
    const bx = w + 120 - ((w * 0.36 + 120 + t * 10 * scale) % span);
    const wy = hz + (h - hz) * 0.2;
    const by = wy + Math.sin(t * 0.9) * 1.6 * scale;
    const roll = Math.sin(t * 0.7 + 1) * 0.035;

    // The dark reflection and the wake sit on the water, under the hull.
    ctx.fillStyle = 'rgba(2,5,12,0.42)';
    ctx.beginPath();
    ctx.ellipse(bx, wy + 7 * scale, 34 * scale, 5 * scale, 0, 0, 6.2832);
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const k = i / 4;
      const shimmer = Math.sin(t * 2.2 + i * 1.7);
      ctx.fillStyle = `rgba(190,205,230,${(0.34 - k * 0.26) * (0.75 + 0.25 * shimmer)})`;
      const len = (20 + i * 15) * scale;
      const gap = (i * 5 + 3) * scale;
      ctx.fillRect(bx + (28 + i * 19) * scale, wy + gap * 0.55 + 1, len, 1.3);
      ctx.fillRect(bx + (28 + i * 19) * scale, wy - gap * 0.2 + 1, len * 0.7, 1);
    }

    ctx.save();
    // Everything below the wavy waterline is hidden: the hull sits in the sea.
    ctx.beginPath();
    ctx.moveTo(bx - 70 * scale, wy - 120 * scale);
    ctx.lineTo(bx + 70 * scale, wy - 120 * scale);
    for (let x = 70; x >= -70; x -= 7) {
      ctx.lineTo(bx + x * scale, wy + 1.5 * scale + Math.sin(x * 0.14 + t * 2.2) * 1.3 * scale);
    }
    ctx.closePath();
    ctx.clip();

    ctx.translate(bx, by);
    ctx.rotate(roll);
    ctx.scale(scale, scale);
    // Hull.
    ctx.fillStyle = 'rgb(5,8,16)';
    ctx.beginPath();
    ctx.moveTo(-34, -8);
    ctx.quadraticCurveTo(-10, -5, 30, -7);
    ctx.lineTo(25, 7);
    ctx.lineTo(-23, 7);
    ctx.closePath();
    ctx.fill();
    // Mast.
    ctx.fillRect(-1, -64, 1.6, 58);
    // Sails, catching the moon on the side that faces it.
    const main = ctx.createLinearGradient(0, -60, 22, -10);
    main.addColorStop(0, 'rgb(150,163,190)');
    main.addColorStop(1, 'rgb(82,94,122)');
    ctx.fillStyle = main;
    ctx.beginPath();
    ctx.moveTo(1.5, -62);
    ctx.quadraticCurveTo(25, -36, 27, -11);
    ctx.lineTo(1.5, -11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgb(60,70,96)';
    ctx.beginPath();
    ctx.moveTo(-2, -57);
    ctx.quadraticCurveTo(-18, -32, -27, -11);
    ctx.lineTo(-2, -11);
    ctx.closePath();
    ctx.fill();
    // A lamp at the stern.
    const lamp = 0.8 + 0.2 * Math.sin(t * 2.3);
    ctx.fillStyle = `rgba(255,214,140,${lamp})`;
    ctx.fillRect(15, -11, 3.2, 3.2);
    ctx.restore();

    const glow = ctx.createRadialGradient(bx + 16 * scale, by - 9 * scale, 0, bx + 16 * scale, by - 9 * scale, 15 * scale);
    glow.addColorStop(0, `rgba(255,205,120,${0.5 * lamp})`);
    glow.addColorStop(1, 'rgba(255,205,120,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(bx, by - 25 * scale, 32 * scale, 32 * scale);
  };
}

/* ---------- putting it together ---------- */

export function startSea(water: HTMLCanvasElement, skyCanvas: HTMLCanvasElement, palette: Palette = NIGHT) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const gl = makeWater(water);

  // The shader is the costly part, so it runs below screen resolution and
  // below the display's rate. Water hides that well.
  const WATER_SCALE = coarse ? 0.5 : 0.75;
  const FRAME = coarse ? 1000 / 24 : 1000 / 40;

  let paintSky: (now: number, glow?: number) => void = () => {};
  let moonDir: [number, number, number] = [0, 0.3, 1];
  let moon = { x: 0, y: 0, r: 1 };
  let w = 0, h = 0;
  let cursor: { x: number; y: number } | null = null;
  let glow = 0;

  const size = () => {
    const box = water.parentElement!;
    w = box.clientWidth;
    h = box.clientHeight;
    if (!w || !h) return; // Not laid out: try again on the next resize.
    const hz = h * HORIZON;
    skyCanvas.width = w;
    skyCanvas.height = h;
    paintSky = makeSky(skyCanvas, w, h, palette);

    const s = moonSpot(w, h);
    moon = s;
    const dy = (hz - s.y) / h;
    const len = (x: number) => Math.hypot(x, dy, 1.05);
    moonDir = [((s.x - w / 2) / h) / len((s.x - w / 2) / h), dy / len((s.x - w / 2) / h), 1.05 / len((s.x - w / 2) / h)];

    // The water starts a pixel above the horizon and on a whole pixel. On a
    // fractional edge the two canvases left a hairline of page showing through.
    const top = Math.floor(hz) - 1;
    water.style.top = `${top}px`;
    water.style.height = `${h - top}px`;
    gl?.size(Math.round(w * WATER_SCALE), Math.round((h - top) * WATER_SCALE), h * WATER_SCALE, palette);
  };
  size();

  let lastWidth = innerWidth;
  const resize = () => {
    // A phone's address bar changing the height shouldn't rebuild the sky.
    if (coarse && innerWidth === lastWidth) return;
    lastWidth = innerWidth;
    size();
  };
  addEventListener('resize', resize, { passive: true });

  const pointer = (e: PointerEvent) => (cursor = { x: e.clientX, y: e.clientY });
  const fine = matchMedia('(pointer: fine)').matches;
  if (fine) addEventListener('pointermove', pointer, { passive: true });

  const draw = (now: number) => {
    // The moon brightens when the cursor is on it, and so does its path on the water.
    const near = cursor ? Math.max(0, Math.min(1, 1 - (Math.hypot(cursor.x - moon.x, cursor.y - moon.y) - moon.r) / (moon.r * 1.5))) : 0;
    glow += (near - glow) * 0.08;
    paintSky(now, glow);
    gl?.draw(now * 0.001, moonDir, glow);
  };

  if (still) {
    draw(0);
    return () => {
      removeEventListener('resize', resize);
    };
  }

  let raf = 0;
  let last = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (now - last < FRAME) return;
    last = now;
    draw(now);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    removeEventListener('resize', resize);
    if (fine) removeEventListener('pointermove', pointer);
  };
}
