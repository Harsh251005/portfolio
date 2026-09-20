/* ---------------------------------------------------------------
   Identity and outbound links, in one place.

   Nothing here is invented. A link with href: null renders as a
   visible ⟨missing⟩ marker rather than a dead or guessed URL.
   Fill these in and every page picks them up.
   --------------------------------------------------------------- */

export const OWNER = {
  name: 'Harsh Dharnidharka',
  role: 'AI Engineer',
  location: 'Mumbai, India',
  /** Used for the site title and social cards. */
  tagline: 'I build software that makes decisions on its own.',
};

export interface Link {
  label: string;
  href: string | null;
  external?: boolean;
}

export const LINKS: Link[] = [
  { label: 'Email', href: null },
  { label: 'GitHub', href: null, external: true },
  { label: 'LinkedIn', href: null, external: true },
];
