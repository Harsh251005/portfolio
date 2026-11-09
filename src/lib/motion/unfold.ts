/* Unfold from the top line: each [data-unfold] item inside the element opens
   once it is well into view (its top above 75% of the screen), not the moment
   it peeks in, so the visitor actually sees it happen. What the opening looks
   like is up to the component's CSS, keyed on `.unfold-armed`, `.in` and
   `.done`. Set --d on an item to stagger it.

   Without script, or with reduced motion, the root is never armed and
   everything is simply there. Each item also gets `.done` on a timer, which
   the CSS uses to snap to the finished state if a transition never ran
   (background tabs). Items already scrolled past, e.g. after a refresh that
   keeps the reader's place, open at once. */
const DONE_AFTER = 2600;

export function unfold(root: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-unfold]'));
  root.classList.add('unfold-armed');
  const timers: number[] = [];

  const open = (el: HTMLElement) => {
    if (el.classList.contains('in')) return;
    el.classList.add('in');
    timers.push(window.setTimeout(() => el.classList.add('done'), DONE_AFTER));
  };

  const check = () => {
    for (const el of items) {
      if (el.getBoundingClientRect().top < innerHeight * 0.75) open(el);
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
