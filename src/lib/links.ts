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
  tagline: 'I build AI products people can actually rely on. Then I try to break them, so your users don’t.',
};

export interface Link {
  label: string;
  href: string | null;
  external?: boolean;
}

/** The resume PDF, served from public/. Replace the file to update it. */
export const RESUME = '/Harsh_Dharnidharka_Resume.pdf';

export const LINKS: Link[] = [
  { label: 'Email', href: 'mailto:dharnidharkaharsh@gmail.com' },
  { label: 'GitHub', href: 'https://github.com/Harsh251005', external: true },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/harsh-dharnidharka',
    external: true,
  },
  { label: 'Resume', href: RESUME },
];

/** GitHub handle, used by anything that reads his public activity. */
export const GITHUB_USER = 'Harsh251005';
