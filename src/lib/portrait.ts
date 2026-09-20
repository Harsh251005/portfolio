/* ---------------------------------------------------------------
   The portrait, if there is one.

   Drop a file at `src/images/portrait.jpg` (or .jpeg / .png / .webp)
   and it appears on the About section — hashed, sized and optimised
   by the build. No other file needs touching. Remove it and the
   section falls back to a deliberate drawn frame rather than a gap.
   --------------------------------------------------------------- */

const found = import.meta.glob<{ default: ImageMetadata }>(
  '../images/portrait.{jpg,jpeg,png,webp}',
  { eager: true },
);

const first = Object.values(found)[0];

export const PORTRAIT: ImageMetadata | null = first?.default ?? null;
