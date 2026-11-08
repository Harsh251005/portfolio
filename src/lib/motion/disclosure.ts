/* ---------------------------------------------------------------
   Smooth open and close for every <details> on the site.

   The browser snaps a <details> open or shut. This catches the click on
   its summary and grows or shrinks the box to its new height instead,
   so the write-up (and any later fold) slides rather than jumps. A
   second click mid-way reverses from wherever it is.

   One listener on the document, so it keeps working across page
   changes. With reduced motion, the browser's own snap is left alone.
   --------------------------------------------------------------- */

const running = new WeakMap<HTMLDetailsElement, Animation>();

/** Longer folds take a little longer, within limits. */
const durationFor = (px: number) => Math.min(620, Math.max(280, 240 + px * 0.18));

function easing() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--ease').trim();
  return v || 'cubic-bezier(0.22, 0.61, 0.36, 1)';
}

function toggle(details: HTMLDetailsElement) {
  const from = details.getBoundingClientRect().height;
  running.get(details)?.cancel();

  // Closing if it is fully open; opening if it is shut or still closing.
  const opening = !details.open || details.hasAttribute('data-closing');
  details.removeAttribute('data-closing');

  // Measure both end states without painting either.
  details.open = false;
  const shut = details.getBoundingClientRect().height;
  details.open = true;
  const full = details.getBoundingClientRect().height;
  const to = opening ? full : shut;

  if (!opening) details.setAttribute('data-closing', '');
  details.style.overflow = 'hidden';

  const anim = details.animate(
    { height: [`${from}px`, `${to}px`] },
    { duration: durationFor(Math.abs(to - from)), easing: easing() },
  );
  running.set(details, anim);

  if (opening) {
    // The contents fade in as the box opens.
    for (const el of details.children) {
      if (el.tagName === 'SUMMARY') continue;
      (el as HTMLElement).animate(
        { opacity: [0, 1], transform: ['translateY(-6px)', 'none'] },
        { duration: durationFor(to - from) + 80, easing: easing() },
      );
    }
  }

  const tidy = () => {
    details.style.overflow = '';
    running.delete(details);
  };
  anim.onfinish = () => {
    if (!opening) {
      details.open = false;
      details.removeAttribute('data-closing');
    }
    tidy();
  };
  anim.oncancel = tidy;
}

let armed = false;

export function smoothDisclosures() {
  if (armed) return;
  armed = true;
  document.addEventListener('click', (e) => {
    const summary = (e.target as Element | null)?.closest?.('summary');
    const details = summary?.parentElement;
    if (!(details instanceof HTMLDetailsElement) || details.querySelector(':scope > summary') !== summary) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    toggle(details);
  });
}
