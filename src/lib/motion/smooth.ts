/* ---------------------------------------------------------------
   Smooth scrolling.

   Hand-rolling this means reimplementing trackpad momentum, touch
   handling, keyboard paging and anchor behaviour — and getting any
   of them slightly wrong makes a site feel worse than native. Lenis
   is ~3KB and already correct, so it earns the dependency.

   Disabled outright for anyone who asked for reduced motion: this is
   the one effect that cannot be opted out of by looking away.
   --------------------------------------------------------------- */

export async function initSmoothScroll() {
  if (typeof window === 'undefined') return null;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  // Touch devices already have momentum scrolling that feels right.
  if (matchMedia('(pointer: coarse)').matches) return null;

  const { default: Lenis } = await import('lenis');

  const lenis = new Lenis({
    // Low and quick. Enough to take the edge off a wheel tick without
    // the laggy, detached feeling that long durations produce.
    duration: 0.9,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  // Lenis takes over the scroll position, which means window.scrollTo
  // no longer moves the page. Exposing the instance gives tests and
  // debugging tools a way to drive it; nothing in the site reads this.
  (window as unknown as { __lenis?: unknown }).__lenis = lenis;

  let raf = 0;
  function frame(time: number) {
    lenis.raf(time);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // In-page anchors have to go through Lenis or they fight it. A link can ask
  // to stop part-way into a held section (`data-scroll-progress`, 0 to 1 of
  // the hold) instead of at its top, so a light scroll carries on from there.
  function onClick(event: MouseEvent) {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;
    const link = (event.target as HTMLElement)?.closest?.<HTMLAnchorElement>('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    event.preventDefault();

    let offset = 0;
    const progress = Number(link.dataset.scrollProgress);
    const hold = target.querySelector<HTMLElement>('.pinned');
    if (progress > 0 && hold) {
      const into = hold.getBoundingClientRect().top - target.getBoundingClientRect().top;
      // Lenis stops short by the page's scroll-padding; this puts it back.
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      offset = into + pad + progress * (hold.offsetHeight - innerHeight);
    }
    lenis.scrollTo(target, { offset });
  }

  // Capture phase: the page router also claims same-page links, and has to
  // find this one already handled.
  document.addEventListener('click', onClick, true);

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('click', onClick, true);
    delete (window as unknown as { __lenis?: unknown }).__lenis;
    lenis.destroy();
  };
}

/** After a refresh: put the page back at `y`, re-placing it while held
 *  sections add height, until the page stops growing. No glide. Returns a
 *  function that cancels it, and it cancels itself on a wheel or touch. */
export function restoreTo(y: number) {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: unknown, o?: object) => void } }).__lenis;
  let stopped = false;
  let tries = 0;
  let lastHeight = -1;
  let steady = 0;
  const jump = () => { scrollTo(0, y); lenis?.scrollTo(y, { immediate: true, force: true }); };
  jump();
  const tick = () => {
    if (stopped) return;
    const height = document.documentElement.scrollHeight;
    steady = height === lastHeight ? steady + 1 : 0;
    lastHeight = height;
    jump();
    if (steady >= 3) return;
    if (++tries < 40) setTimeout(tick, 100);
  };
  setTimeout(tick, 100);
  const cancel = () => { stopped = true; };
  addEventListener('wheel', cancel, { once: true, passive: true });
  addEventListener('touchstart', cancel, { once: true, passive: true });
  return cancel;
}

/** Arriving from another page with `#id` in the address: wait for the page to
 *  stop growing (held sections add height as they start up), then glide down
 *  from the top, so the link visibly goes somewhere and ends in the right place.
 *  Returns a function that cancels it, and it cancels itself on a wheel or touch. */
export function landOnHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return () => {};

  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: unknown, o?: object) => void } }).__lenis;
  let stopped = false;
  let tries = 0;
  let lastHeight = -1;
  let steady = 0;

  // A section can ask to be landed in part-way (`land` on its Band, e.g. the
  // project deck opens fully spread). That lands without a glide, at the same
  // point every time: back link, browser Back, or a shared link.
  const jump = (y: number) => { scrollTo(0, y); lenis?.scrollTo(y, { immediate: true, force: true }); };
  const landing = (target: HTMLElement) => {
    const land = Number(target.dataset.land);
    if (!(land > 0)) return null;
    const hold = target.querySelector<HTMLElement>('.pinned');
    if (!hold) return null; // narrow screens: no held deck, glide to the top
    return hold.getBoundingClientRect().top + scrollY + land * (hold.offsetHeight - innerHeight);
  };

  jump(0);

  const tick = () => {
    if (stopped) return;
    const target = document.getElementById(id);
    const height = document.documentElement.scrollHeight;
    steady = height === lastHeight ? steady + 1 : 0;
    lastHeight = height;
    const y = target ? landing(target) : null;
    if (y !== null) {
      // Held sections add height as they start up; keep re-placing until steady.
      jump(y);
      if (steady >= 3) return;
    } else if (target && steady >= 3) {
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else target.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (++tries < 40) setTimeout(tick, 100);
  };
  setTimeout(tick, 100);

  const cancel = () => { stopped = true; };
  addEventListener('wheel', cancel, { once: true, passive: true });
  addEventListener('touchstart', cancel, { once: true, passive: true });
  return cancel;
}
