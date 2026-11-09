/* A section's entrance: each [data-arrive] item inside the element arrives
   once it is well into view (its top above 75% of the screen), not the moment
   it peeks in, so the visitor actually sees it happen (or once it is fully on
   screen, for things at the very end of the page). What the arrival looks
   like is up to each section's own CSS, keyed on `.arrive-armed` on the root
   and `.in` / `.done` on the item, so every section can enter differently.
   Set --d on an item to stagger it.

   Without script, or with reduced motion, the root is never armed and
   everything is simply there. Each item also gets `.done` on a timer, which
   the CSS uses to snap to the finished state if a transition never ran
   (background tabs). Items already scrolled past, e.g. after a refresh that
   keeps the reader's place, open at once. */
export function arrive(root: HTMLElement, { doneAfter = 3000 }: { doneAfter?: number } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-arrive]'));
  root.classList.add('arrive-armed');
  const timers: number[] = [];

  const open = (el: HTMLElement) => {
    if (el.classList.contains('in')) return;
    el.classList.add('in');
    timers.push(window.setTimeout(() => el.classList.add('done'), doneAfter));
  };

  const check = () => {
    for (const el of items) {
      const r = el.getBoundingClientRect();
      // Fully on screen counts too: the last things on the page (the footer)
      // can never scroll up as far as the 75% line.
      if (r.top < innerHeight * 0.75 || (r.bottom <= innerHeight && r.bottom > 0)) open(el);
    }
    if (items.every((el) => el.classList.contains('in'))) stop();
  };

  addEventListener('scroll', check, { passive: true });
  // A poll as well, for scrolls that fire no events (and smooth scrolling).
  const poll = setInterval(check, 400);
  const stop = () => {
    removeEventListener('scroll', check);
    clearInterval(poll);
  };
  check();

  return {
    destroy() {
      stop();
      timers.forEach(clearTimeout);
    },
  };
}
