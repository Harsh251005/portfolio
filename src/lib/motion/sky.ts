/* ---------------------------------------------------------------
   Sky colour for a given hour in Mumbai.

   Deliberately never reaches daylight. A bright sky at noon would
   break the glass panels and drop white text below usable contrast,
   so the range runs from deep night to dusk and back. The hour
   shifts the hue; it never raises the overall brightness much.
   --------------------------------------------------------------- */

export interface Sky {
  /** Top of the sky gradient. */
  high: string;
  /** Near the horizon, where a city's light pollution sits. */
  low: string;
  /** Tint of the haze layer between building ranks. */
  haze: string;
  /** How visible stars are, 0–1. */
  stars: number;
  label: string;
}

const KEYS: { at: number; sky: Sky }[] = [
  { at: 0,  sky: { high: '#05070f', low: '#0d1430', haze: '#16204a', stars: 1,    label: 'late' } },
  { at: 5,  sky: { high: '#070c1c', low: '#1b2145', haze: '#2a2f5e', stars: 0.7,  label: 'before dawn' } },
  { at: 7,  sky: { high: '#0b1228', low: '#33305c', haze: '#4a3f6b', stars: 0.25, label: 'dawn' } },
  { at: 12, sky: { high: '#0c1430', low: '#25325e', haze: '#33426e', stars: 0.1,  label: 'midday' } },
  { at: 17, sky: { high: '#0a0f26', low: '#3a2a52', haze: '#563761', stars: 0.3,  label: 'dusk' } },
  { at: 19, sky: { high: '#070a1a', low: '#241a3c', haze: '#35244e', stars: 0.7,  label: 'evening' } },
  { at: 22, sky: { high: '#05070f', low: '#101736', haze: '#1a2350', stars: 1,    label: 'night' } },
  { at: 24, sky: { high: '#05070f', low: '#0d1430', haze: '#16204a', stars: 1,    label: 'late' } },
];

function hex(c: string) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

/** Current hour in Mumbai, as a float, wherever the visitor is. */
export function mumbaiHour(now = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return h + m / 60;
}

export function skyFor(hour: number): Sky {
  let i = 0;
  while (i < KEYS.length - 1 && KEYS[i + 1].at <= hour) i++;
  const a = KEYS[i];
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const span = b.at - a.at || 1;
  const t = Math.min(1, Math.max(0, (hour - a.at) / span));

  return {
    high: mix(a.sky.high, b.sky.high, t),
    low: mix(a.sky.low, b.sky.low, t),
    haze: mix(a.sky.haze, b.sky.haze, t),
    stars: a.sky.stars + (b.sky.stars - a.sky.stars) * t,
    label: t < 0.5 ? a.sky.label : b.sky.label,
  };
}
