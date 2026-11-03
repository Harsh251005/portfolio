/* A quiet entrance: anything marked [data-reveal] inside the element fades
   and rises once, when it scrolls into view. Set --d on an item to stagger.

   The styles are in base.css and only apply after this has marked the root,
   so without script, or with reduced motion, everything is simply there. A
   poll covers observers that never fire. */
export function reveal(root: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  root.classList.add('reveal-armed');

  const show = (el: Element) => el.classList.add('in');
  const io = new IntersectionObserver(
    (list) => list.forEach((e) => e.isIntersecting && show(e.target)),
    { threshold: 0.15 },
  );
  items.forEach((el) => io.observe(el));

  const poll = setInterval(() => {
    items.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.9 && r.bottom > 0) show(el);
    });
    if (items.every((el) => el.classList.contains('in'))) clearInterval(poll);
  }, 500);

  return {
    destroy() {
      io.disconnect();
      clearInterval(poll);
    },
  };
}
