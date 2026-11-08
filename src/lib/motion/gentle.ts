/* ---------------------------------------------------------------
   Svelte transitions for anything that appears or disappears in the
   demos, so nothing just pops in or vanishes.

   appear: a fade with a small rise, for buttons and short notes.
   fold:   the space opens and closes too, for blocks whose height
           would otherwise make the page jump.

   Both drop to nothing with reduced motion.
   --------------------------------------------------------------- */
import { fade, slide } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

const still = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function appear(node: Element, { duration = 260, delay = 0 } = {}) {
  if (still()) return { duration: 0 };
  return {
    delay,
    duration,
    easing: cubicOut,
    css: (t: number) => `opacity: ${t}; transform: translateY(${(1 - t) * 6}px);`,
  };
}

export function fold(node: Element, { duration = 340, delay = 0 } = {}) {
  if (still()) return { duration: 0 };
  const s = slide(node, { duration, delay, easing: cubicOut });
  const f = fade(node, { duration, delay, easing: cubicOut });
  return {
    delay,
    duration,
    easing: cubicOut,
    css: (t: number, u: number) => `${s.css!(t, u)} ${f.css!(t, u)}`,
  };
}
