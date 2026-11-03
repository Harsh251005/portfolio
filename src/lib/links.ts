/* ---------------------------------------------------------------
   Identity and outbound links, in one place.

   Nothing here is invented — these are the real ones he gave.
   A link with href: null renders as a visible ⟨missing⟩ marker
   rather than a dead or guessed URL.
   --------------------------------------------------------------- */

export const OWNER = {
  name: 'Harsh Dharnidharka',
  role: 'AI Engineer',
  location: 'Mumbai, India',
  /** Shown on the first screen. Change or remove when it stops being true. */
  status: 'Open to work',
  /** Used for the site title and social cards. */
  tagline: 'I build AI that answers phones, reads documents and fixes its own code.',
};

export interface Link {
  label: string;
  href: string | null;
  external?: boolean;
}

export const LINKS: Link[] = [
  { label: 'Email', href: 'mailto:dharnidharkaharsh@gmail.com' },
  { label: 'GitHub', href: 'https://github.com/Harsh251005', external: true },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/harsh-dharnidharka',
    external: true,
  },
];

/** GitHub handle, used by anything that reads his public activity. */
export const GITHUB_USER = 'Harsh251005';
