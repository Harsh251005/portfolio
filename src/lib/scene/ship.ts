/* ---------------------------------------------------------------
   The cruise liner out on the moonlit sea, with people living on it.

   Drawn on the sky canvas each frame. Ship space is 300 units long, bow at
   x = -150 (it heads left), waterline at y = 0, up is negative. People are
   a touch larger than life so they read at this distance, and they always
   stand in front of something lit (lounge glass, restaurant windows, the
   sky bar), because a dark figure on a dark wall can't be seen.

   Calm on purpose: a cabin light changes every few seconds, nothing
   flickers at random.
   --------------------------------------------------------------- */

type RGB = [number, number, number];
type Deck = { y0: number; y1: number; a: number; b: number; kind: 'promenade' | 'dining' | 'cabins' | 'lido' };
type Cabin = { x: number; d: Deck; on: boolean; cur: number; tv: boolean; col: RGB; dim: number };
type Walker = {
  x: number; a: number; b: number; dir: number; v: number; walking: boolean; timer: number;
  ph: number; pair: boolean; gap: number; s: number; s2: number;
};
type Smoke = { x: number; y: number; r: number; age: number; vx: number; vy: number };

const DECKS: Deck[] = [
  { y0: -22, y1: -30, a: -126, b: 146, kind: 'promenade' },
  { y0: -30, y1: -38, a: -120, b: 141, kind: 'dining' },
  { y0: -38, y1: -45, a: -115, b: 136, kind: 'cabins' },
  { y0: -45, y1: -52, a: -111, b: 131, kind: 'cabins' },
  { y0: -52, y1: -59, a: -108, b: 124, kind: 'cabins' },
  { y0: -59, y1: -65, a: -96, b: 112, kind: 'lido' },
];
const DIN = DECKS[1];
/** The open top deck's floor. */
const SUN = { y: -65, a: -92, b: 76 };
/** A person's height in ship units. */
const PH = 5.2;

const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

/** A standing or walking figure, feet at (x, feet), in the current fill
 *  colour, with an optional warm rim from the lamps above. */
function person(c: CanvasRenderingContext2D, x: number, feet: number, h: number, walking: boolean, ph: number, rim: string | null) {
  const head = h * 0.12;
  const hip = feet - h * 0.47;
  const shoulder = feet - h * 0.8;
  const swing = walking ? Math.sin(ph) * h * 0.13 : 0;
  c.beginPath();
  c.moveTo(x - h * 0.06, hip);
  c.lineTo(x - h * 0.05 + swing, feet);
  c.lineTo(x + h * 0.03 + swing, feet);
  c.lineTo(x, hip + h * 0.06);
  c.lineTo(x - h * 0.03 - swing, feet);
  c.lineTo(x + h * 0.05 - swing, feet);
  c.lineTo(x + h * 0.07, hip);
  c.lineTo(x + h * 0.11, shoulder + h * 0.04);
  c.quadraticCurveTo(x, shoulder - h * 0.03, x - h * 0.11, shoulder + h * 0.04);
  c.closePath();
  c.fill();
  c.beginPath();
  c.arc(x, shoulder - head * 0.95, head, 0, 6.2832);
  c.fill();
  if (rim) {
    const f = c.fillStyle;
    c.fillStyle = rim;
    c.beginPath();
    c.arc(x, shoulder - head * 0.95, head, 3.4, 6.0);
    c.arc(x, shoulder - head * 0.95, head * 0.6, 6.0, 3.4, true);
    c.fill();
    c.fillStyle = f;
  }
}

/** A soft warm light, drawn scaled wherever something glows. */
function makeGlow() {
  const glow = document.createElement('canvas');
  glow.width = glow.height = 64;
  const g = glow.getContext('2d')!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,200,130,1)');
  r.addColorStop(0.4, 'rgba(255,180,110,0.35)');
  r.addColorStop(1, 'rgba(255,180,110,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return glow;
}

/** Sets up the ship and the people on it; returns the per-frame painter. */
export function makeShip() {
  let seed = 11;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const pick = (a: number, b: number) => a + rnd() * (b - a);
  const warm = (): RGB => {
    const k = rnd();
    return [255, 180 + k * 40, 100 + k * 70];
  };
  const glow = makeGlow();

  // Cabin lights, and the odd blue of a TV.
  const cabins: Cabin[] = [];
  for (const d of DECKS.filter((d) => d.kind === 'cabins')) {
    for (let x = d.a + 7; x < d.b - 5; x += 3.4) {
      const on = rnd() < 0.5;
      cabins.push({ x, d, on, cur: on ? 1 : 0, tv: rnd() < 0.04, col: warm(), dim: 0.55 + rnd() * 0.45 });
    }
  }
  const portholes: { x: number; col: RGB }[] = [];
  for (let x = -118; x < 140; x += 4.6) if (rnd() < 0.35) portholes.push({ x, col: warm() });

  // The restaurant: panes, and the people at its tables.
  const panes: { x: number; lit: boolean }[] = [];
  for (let x = DIN.a + 9; x < DIN.b - 10; x += 6.7) panes.push({ x, lit: rnd() > 0.12 });
  const diners: { x: number; ph: number; sp: number; s: number }[] = [];
  for (const p of panes) {
    if (!p.lit) continue;
    const n = Math.floor(pick(0, 3.2));
    for (let i = 0; i < n; i++) diners.push({ x: p.x + pick(0.8, 5.2), ph: rnd() * 6.3, sp: pick(0.3, 0.9), s: pick(0.92, 1.08) });
  }

  // People who walk about, stop to look at the sea, and turn back.
  const crowd = (n: number, a: number, b: number, couples: number): Walker[] =>
    Array.from({ length: n }, () => ({
      x: pick(a, b), a, b, dir: rnd() < 0.5 ? -1 : 1, v: pick(2.2, 3.4),
      walking: rnd() < 0.6, timer: pick(2, 10), ph: rnd() * 6.3,
      pair: rnd() < couples, gap: pick(1.1, 1.5), s: pick(0.9, 1.06), s2: pick(0.85, 1.0),
    }));
  const promenaders = crowd(11, -122, 142, 0.35);
  const waiters = crowd(3, DIN.a + 9, DIN.b - 10, 0).map((w) => ({ ...w, v: pick(3.5, 4.5), walking: true }));
  const sunbathers = crowd(9, SUN.a + 13, SUN.b - 9, 0.45).map((p) => ({ ...p, v: pick(1.6, 2.6), walking: rnd() < 0.3 }));
  const balcony: { cab: Cabin; life: number; age: number; dx: number; s: number }[] = [];
  let nextToggle = 5, nextBalcony = 2;

  const stepCrowd = (list: Walker[], dt: number) => {
    for (const p of list) {
      p.timer -= dt;
      if (p.timer <= 0) {
        p.walking = !p.walking;
        p.timer = p.walking ? pick(4, 14) : pick(2.5, 12);
        if (rnd() < 0.4) p.dir *= -1;
      }
      if (p.walking) {
        p.x += p.dir * p.v * dt;
        p.ph += p.v * dt * 2.1;
        if (p.x < p.a) { p.x = p.a; p.dir = 1; }
        if (p.x > p.b) { p.x = p.b; p.dir = -1; }
      }
    }
  };

  const smoke: Smoke[] = [];
  let nextPuff = 0;
  let last: number | null = null;

  return (ctx: CanvasRenderingContext2D, t: number, w: number, h: number, hz: number) => {
    const dt = last === null ? 0.016 : Math.min(0.1, t - last);
    last = t;

    // On a phone the hero text and buttons fill the middle, so the ship is
    // smaller (about 60% of the width) and sails lower, below the buttons.
    const narrow = w < h;
    const scale = Math.min(1, w / 1100) * 0.45 + 0.55;
    const k = narrow ? (w * 0.6) / 300 : scale * 1.75; // px per unit
    const L = 300 * k;
    const speed = 3 * scale; // px per second: very slow, it takes minutes to cross
    const span = w + L + 200;
    // It starts in view, to the right of the hero text (centred on a phone).
    const bx = w + L / 2 + 100 - ((w * (narrow ? 0.5 : 0.28) + L / 2 + 100 + t * speed) % span);
    const wy = hz + (h - hz) * (narrow ? 0.74 : 0.34);
    const by = wy + Math.sin(t * 0.5) * 0.6 * scale;
    const roll = Math.sin(t * 0.37 + 1) * 0.004;

    /* ---- life on board ---- */
    nextToggle -= dt;
    if (nextToggle <= 0) {
      nextToggle = pick(6, 14);
      const cab = cabins[Math.floor(rnd() * cabins.length)];
      cab.on = !cab.on;
    }
    for (const cab of cabins) cab.cur += ((cab.on ? 1 : 0) - cab.cur) * Math.min(1, dt * 9);
    nextBalcony -= dt;
    if (nextBalcony <= 0) {
      nextBalcony = pick(3, 8);
      const lit = cabins.filter((c) => c.cur > 0.9);
      if (balcony.length < 4 && lit.length) {
        const cab = lit[Math.floor(rnd() * lit.length)];
        balcony.push({ cab, life: pick(8, 22), age: 0, dx: pick(-0.6, 0.6), s: pick(0.9, 1.05) });
      }
    }
    for (let i = balcony.length - 1; i >= 0; i--) {
      balcony[i].age += dt;
      if (balcony[i].age > balcony[i].life) balcony.splice(i, 1);
    }
    stepCrowd(promenaders, dt);
    stepCrowd(waiters, dt);
    stepCrowd(sunbathers, dt);

    /* ---- on the water: reflections, then the wake ---- */
    ctx.save();
    ctx.translate(bx, wy);
    ctx.scale(k, k);
    const shade = ctx.createLinearGradient(0, 0, 0, 34);
    shade.addColorStop(0, 'rgba(2,4,10,0.6)');
    shade.addColorStop(1, 'rgba(2,4,10,0)');
    ctx.fillStyle = shade;
    ctx.fillRect(-140, 0, 288, 34);

    // Every lit window drops a broken streak of light down the ripples.
    const cols = new Float32Array(76);
    const add = (x: number, v: number) => {
      const i = Math.floor((x + 152) / 4);
      if (i >= 0 && i < cols.length) cols[i] += v;
    };
    for (const cab of cabins) add(cab.x, cab.cur * 0.12);
    for (const p of panes) if (p.lit) add(p.x + 3, 0.32);
    for (let x = DECKS[0].a + 4; x < DECKS[0].b - 2; x += 9) add(x, 0.22);
    for (const p of portholes) add(p.x, 0.08);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < cols.length; i++) {
      const v = Math.min(1, cols[i]);
      if (v < 0.04) continue;
      const cx = i * 4 - 150;
      for (let j = 0; j < 9; j++) {
        const fade = 1 - j / 9;
        const flick = 0.82 + 0.18 * Math.sin(t * 1.1 + j * 2.1 + i * 1.3);
        ctx.fillStyle = `rgba(255,190,120,${v * 0.75 * fade * flick})`;
        const y = 2.5 + j * 3 + Math.sin(t * 0.8 + i) * 0.4;
        const off = Math.sin(t * 1.5 + j * 1.2 + i * 0.7) * (0.6 + j * 0.25);
        ctx.fillRect(cx + off - 1.4, y, 2.8 + j * 0.15, 0.6);
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    // Foam at the bow and a long wake behind the stern.
    for (let i = 0; i < 6; i++) {
      const a = (0.5 - i * 0.07) * (0.7 + 0.3 * Math.sin(t * 3.1 + i * 1.9));
      ctx.fillStyle = `rgba(205,215,235,${a})`;
      ctx.fillRect(-136 + i * 2.2 + Math.sin(t * 2 + i) * 0.5, 0.4 + i * 0.35, 9 - i, 0.7);
    }
    for (let i = 0; i < 7; i++) {
      const q = i / 6;
      const s = Math.sin(t * 2.2 + i * 1.7);
      ctx.fillStyle = `rgba(190,205,230,${(0.36 - q * 0.28) * (0.75 + 0.25 * s)})`;
      ctx.fillRect(146 + i * 22, 0.6 + i * 0.9, 18 + i * 10, 0.7);
      ctx.fillRect(146 + i * 24, -0.2 + i * 0.25, 12 + i * 6, 0.5);
    }
    ctx.restore();

    /* ---- the ship ---- */
    ctx.save();
    // Hide everything under the wavy waterline.
    ctx.beginPath();
    ctx.moveTo(bx - L, wy - 200 * k);
    ctx.lineTo(bx + L, wy - 200 * k);
    for (let x = 160; x >= -160; x -= 6) {
      ctx.lineTo(bx + x * k, wy + 1.2 * k + Math.sin(x * 0.11 + t * 2.2) * 0.5 * k);
    }
    ctx.closePath();
    ctx.clip();

    ctx.translate(bx, by);
    ctx.rotate(roll);
    ctx.scale(k, k);
    const c = ctx;

    // Hull.
    const hullG = c.createLinearGradient(0, -27, 0, 4);
    hullG.addColorStop(0, 'rgb(24,30,48)');
    hullG.addColorStop(1, 'rgb(5,8,16)');
    c.fillStyle = hullG;
    c.beginPath();
    c.moveTo(-150, -27.5);
    c.quadraticCurveTo(-142, -10, -131, 6);
    c.lineTo(141, 6);
    c.quadraticCurveTo(149, -4, 150, -22);
    c.quadraticCurveTo(-40, -21.5, -150, -27.5);
    c.fill();
    c.fillStyle = 'rgba(170,180,205,0.5)';
    c.beginPath();
    c.moveTo(-150, -27.5);
    c.quadraticCurveTo(-40, -21.5, 150, -22);
    c.lineTo(150, -21.4);
    c.quadraticCurveTo(-40, -20.9, -149.4, -26.6);
    c.fill();
    c.fillStyle = 'rgb(3,5,10)';
    c.beginPath();
    c.arc(-139, -21, 0.9, 0, 6.2832);
    c.fill();
    for (const p of portholes) {
      c.fillStyle = rgba(p.col, 0.8);
      c.fillRect(p.x, -12, 0.9, 0.9);
    }

    // Superstructure, deck by deck.
    for (const d of DECKS) {
      const g = c.createLinearGradient(0, d.y1, 0, d.y0);
      g.addColorStop(0, 'rgb(122,132,158)');
      g.addColorStop(1, 'rgb(80,89,114)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(d.a, d.y0);
      c.lineTo(d.b, d.y0);
      c.lineTo(d.b - 1.2, d.y1);
      c.lineTo(d.a + 3, d.y1);
      c.quadraticCurveTo(d.a + 0.3, d.y1 + 1, d.a, d.y0);
      c.fill();

      if (d.kind === 'promenade') {
        // Recessed walkway: warm wall, ceiling lamps, people, rail, lifeboats.
        const wall = c.createLinearGradient(0, d.y1 + 1.2, 0, d.y0);
        wall.addColorStop(0, 'rgb(255,214,150)');
        wall.addColorStop(1, 'rgb(196,128,70)');
        c.fillStyle = wall;
        c.fillRect(d.a + 3, d.y1 + 1.2, d.b - d.a - 5, d.y0 - d.y1 - 1.2);
        c.fillStyle = 'rgba(120,80,50,0.55)';
        for (let x = d.a + 6; x < d.b - 3; x += 5.5) c.fillRect(x, d.y1 + 1.2, 0.35, d.y0 - d.y1 - 1.2);
        c.fillStyle = 'rgb(60,44,40)';
        c.fillRect(d.a + 3, d.y0 - 0.5, d.b - d.a - 5, 0.5);
        c.fillStyle = 'rgb(255,240,205)';
        for (let x = d.a + 4; x < d.b - 2; x += 9) c.fillRect(x - 0.5, d.y1 + 1.2, 1, 0.4);
        c.fillStyle = 'rgb(14,11,13)';
        for (const p of promenaders) {
          person(c, p.x, d.y0, PH * p.s, p.walking, p.ph, 'rgba(255,200,140,0.5)');
          if (p.pair) person(c, p.x + p.gap * -p.dir, d.y0, PH * p.s2, p.walking, p.ph + 1.2, 'rgba(255,200,140,0.5)');
        }
        c.fillStyle = 'rgba(150,160,185,0.9)';
        c.fillRect(d.a + 3, d.y0 - 2.3, d.b - d.a - 5, 0.3);
        for (let x = d.a + 4; x < d.b - 2; x += 3) c.fillRect(x, d.y0 - 2.3, 0.15, 2.3);
        for (let x = -96; x < 104; x += 16) {
          c.fillStyle = 'rgb(20,22,30)';
          c.fillRect(x + 1.5, d.y1, 0.4, 1.6);
          c.fillRect(x + 9.5, d.y1, 0.4, 1.6);
          const lb = c.createLinearGradient(0, d.y1 + 0.4, 0, d.y1 + 2.8);
          lb.addColorStop(0, 'rgb(196,112,58)');
          lb.addColorStop(1, 'rgb(112,58,30)');
          c.fillStyle = lb;
          c.beginPath();
          c.moveTo(x, d.y1 + 0.4);
          c.lineTo(x + 11.4, d.y1 + 0.4);
          c.quadraticCurveTo(x + 11, d.y1 + 2.7, x + 9, d.y1 + 2.8);
          c.lineTo(x + 2, d.y1 + 2.8);
          c.quadraticCurveTo(x + 0.3, d.y1 + 2.7, x, d.y1 + 0.4);
          c.fill();
        }
      }

      if (d.kind === 'dining') {
        // Tall windows of the restaurant: warm light, diners, waiters passing
        // behind the pillars.
        const top = d.y1 + 1.1, bot = d.y0 - 1.3;
        const lightG = c.createLinearGradient(0, top, 0, bot);
        lightG.addColorStop(0, 'rgb(255,214,150)');
        lightG.addColorStop(1, 'rgb(214,140,72)');
        c.fillStyle = lightG;
        c.fillRect(panes[0].x, top, panes[panes.length - 1].x + 6 - panes[0].x, bot - top);
        for (let x = panes[0].x + 3; x < panes[panes.length - 1].x + 6; x += 13.4) {
          c.fillStyle = 'rgba(255,248,225,0.9)';
          c.fillRect(x, top + 0.5, 0.5, 0.4);
        }
        c.fillStyle = 'rgb(28,18,16)';
        for (const p of diners) {
          const sx = p.x + Math.sin(t * p.sp + p.ph) * 0.18;
          const hy = bot - 3.1 * p.s + Math.sin(t * p.sp * 1.3 + p.ph) * 0.06;
          c.beginPath();
          c.arc(sx, hy, 0.7 * p.s, 0, 6.2832);
          c.fill();
          c.beginPath();
          c.moveTo(sx - 1.2 * p.s, bot);
          c.quadraticCurveTo(sx - 1.15 * p.s, hy + 0.7, sx, hy + 0.7);
          c.quadraticCurveTo(sx + 1.15 * p.s, hy + 0.7, sx + 1.2 * p.s, bot);
          c.fill();
        }
        c.fillStyle = 'rgb(40,26,22)';
        for (const p of panes) c.fillRect(p.x - 0.7, bot - 0.9, 6.7, 0.9); // tables
        c.fillStyle = 'rgb(20,14,14)';
        for (const p of waiters) person(c, p.x, bot + 0.6, PH * p.s, true, p.ph, null);
        // Pillars between panes, and the dark ones.
        c.fillStyle = 'rgb(84,93,118)';
        for (const p of panes) {
          c.fillRect(p.x - 0.7, top, 0.7, bot - top);
          if (!p.lit) {
            c.fillStyle = 'rgb(26,30,44)';
            c.fillRect(p.x, top, 6, bot - top);
            c.fillStyle = 'rgb(84,93,118)';
          }
        }
        c.fillRect(panes[panes.length - 1].x + 6, top, 0.7, bot - top);
      }

      if (d.kind === 'cabins') {
        for (const cab of cabins) {
          if (cab.d !== d) continue;
          const x = cab.x, top = d.y1 + 1.1, hgt = d.y0 - d.y1 - 1.6;
          c.fillStyle = 'rgb(22,26,40)';
          c.fillRect(x, top, 2.5, hgt);
          if (cab.cur > 0.02) {
            if (cab.tv) {
              const f = 0.85 + 0.15 * Math.sin(t * 0.9 + x);
              c.fillStyle = `rgba(140,170,255,${cab.cur * 0.65 * f})`;
            } else {
              c.fillStyle = rgba(cab.col, cab.cur * cab.dim);
            }
            c.fillRect(x, top, 2.5, hgt);
          }
        }
        for (const b of balcony) {
          if (b.cab.d !== d) continue;
          const a = Math.min(1, b.age * 1.5, (b.life - b.age) * 1.5);
          c.fillStyle = `rgba(16,12,14,${a})`;
          person(c, b.cab.x + 1.25 + b.dx, d.y0 - 0.2, PH * b.s, false, 0, null);
        }
        // Balcony dividers and glass rails.
        c.fillStyle = 'rgba(160,172,200,0.28)';
        c.fillRect(d.a + 5, d.y0 - 2, d.b - d.a - 8, 2);
        c.fillStyle = 'rgb(96,106,132)';
        for (let x = d.a + 6.6; x < d.b - 5; x += 3.4) c.fillRect(x, d.y1 + 0.8, 0.35, d.y0 - d.y1 - 0.8);
        c.fillStyle = 'rgba(190,200,222,0.8)';
        c.fillRect(d.a + 5, d.y0 - 2.1, d.b - d.a - 8, 0.25);
        if (d === DECKS[4]) {
          // The bridge: dark glass with a faint glow from the instruments.
          c.fillStyle = 'rgb(10,14,22)';
          c.fillRect(d.a + 1, d.y1 + 1.4, 20, 3);
          c.fillStyle = 'rgba(120,220,180,0.35)';
          for (let x = d.a + 3; x < d.a + 20; x += 3.7) c.fillRect(x, d.y1 + 3.4, 0.8, 0.4);
          c.fillStyle = 'rgb(110,120,146)';
          c.fillRect(d.a - 4, d.y1 + 0.6, 6, 1.6); // bridge wing
          c.fillStyle = 'rgb(255,60,50)';
          c.fillRect(d.a - 4, d.y1 + 1.2, 0.9, 0.9); // port side light
        }
      }

      if (d.kind === 'lido') {
        c.fillStyle = 'rgba(255,206,140,0.75)';
        c.fillRect(-60, d.y1 + 1.2, 128, d.y0 - d.y1 - 2.2);
        c.fillStyle = 'rgb(94,104,130)';
        for (let x = -60; x < 70; x += 8) c.fillRect(x, d.y1 + 1.2, 0.5, d.y0 - d.y1 - 2.2);
      }
      c.fillStyle = 'rgba(190,200,222,0.75)';
      c.fillRect(d.a + 2, d.y1, d.b - d.a - 3, 0.35);
    }

    // Sun deck on top: a warm glow from the pool lights, people out for air.
    const bar = c.createLinearGradient(0, SUN.y - 7, 0, SUN.y);
    bar.addColorStop(0, 'rgb(236,184,120)');
    bar.addColorStop(1, 'rgb(255,220,160)');
    c.fillStyle = bar;
    c.fillRect(SUN.a + 10, SUN.y - 7, SUN.b - SUN.a - 16, 7);
    c.fillStyle = 'rgba(120,80,50,0.5)';
    for (let x = SUN.a + 15; x < SUN.b - 6; x += 6) c.fillRect(x, SUN.y - 7, 0.35, 7);
    c.fillStyle = 'rgb(110,120,146)';
    c.fillRect(SUN.a + 8, SUN.y - 8, SUN.b - SUN.a - 12, 1);
    c.fillStyle = 'rgb(18,14,16)';
    for (const p of sunbathers) {
      const rim = 'rgba(255,196,130,0.55)';
      person(c, p.x, SUN.y, PH * p.s, p.walking, p.ph, rim);
      if (p.pair) person(c, p.x + p.gap, SUN.y, PH * p.s2, p.walking, p.ph + 1.2, rim);
    }
    c.fillStyle = 'rgba(170,185,215,0.22)';
    c.fillRect(SUN.a, SUN.y - 2.2, SUN.b - SUN.a, 2.2);
    c.fillStyle = 'rgba(200,210,230,0.7)';
    c.fillRect(SUN.a, SUN.y - 2.3, SUN.b - SUN.a, 0.25);

    // Funnel.
    const fg = c.createLinearGradient(80, 0, 112, 0);
    fg.addColorStop(0, 'rgb(104,114,140)');
    fg.addColorStop(1, 'rgb(150,160,184)');
    c.fillStyle = fg;
    c.beginPath();
    c.moveTo(80, -65);
    c.lineTo(108, -65);
    c.lineTo(115, -86);
    c.lineTo(92, -86);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgb(26,46,86)';
    c.beginPath();
    c.moveTo(86, -76);
    c.lineTo(111.5, -76);
    c.lineTo(112.3, -78.5);
    c.lineTo(86.8, -78.5);
    c.fill();
    c.fillStyle = 'rgb(12,14,20)';
    c.beginPath();
    c.moveTo(91.3, -84);
    c.lineTo(114.4, -84);
    c.lineTo(115, -86);
    c.lineTo(92, -86);
    c.fill();

    // Mast with a turning radar and the white masthead light.
    c.fillStyle = 'rgb(30,34,46)';
    c.fillRect(-78.4, -89, 0.8, 24);
    const rad = Math.cos(t * 2.4);
    c.fillRect(-78 - 4 * Math.abs(rad), -81, 8 * Math.abs(rad) + 0.3, 0.5);
    c.fillRect(-82, -74, 8, 0.4);

    // Strings of lights: bow to mast, mast to funnel, funnel to stern.
    const string = (x0: number, y0: number, x1: number, y1: number, sag: number, step: number) => {
      const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        const x = x0 + (x1 - x0) * u;
        const y = y0 + (y1 - y0) * u + sag * 4 * u * (1 - u);
        c.fillStyle = i % 3 === 0 ? 'rgba(255,236,190,0.9)' : 'rgba(255,210,150,0.77)';
        c.fillRect(x - 0.35, y - 0.35, 0.7, 0.7);
      }
    };
    string(-150, -27.5, -78, -89, 4, 2.6);
    string(-78, -89, 92, -86, 9, 2.6);
    string(115, -86, 150, -22.5, 4, 2.6);
    c.fillStyle = 'rgb(255,255,245)';
    c.fillRect(-78.7, -90.2, 1.4, 1.4);
    ctx.restore();

    // Soft glow around the brightest light, so the ship reads as luminous.
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(k, k);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.12;
    ctx.drawImage(glow, -130, -50, 270, 32);
    ctx.globalAlpha = 0.6;
    ctx.drawImage(glow, -82, -93, 8, 8);
    ctx.restore();

    // Smoke drifts back off the funnel.
    nextPuff -= dt;
    if (nextPuff <= 0) {
      nextPuff = 0.35;
      smoke.push({ x: 103 + pick(-2, 2), y: -87, r: 2.5, age: 0, vx: pick(5, 8), vy: pick(-2.6, -1.6) });
    }
    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(k, k);
    for (let i = smoke.length - 1; i >= 0; i--) {
      const s = smoke[i];
      s.age += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.r += dt * 2.2;
      const a = 0.16 * Math.min(1, s.age * 2) * Math.max(0, 1 - s.age / 9);
      if (a <= 0 && s.age > 1) { smoke.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
      g.addColorStop(0, `rgba(120,128,148,${a})`);
      g.addColorStop(1, 'rgba(120,128,148,0)');
      ctx.fillStyle = g;
      ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
    }
    ctx.restore();
  };
}
