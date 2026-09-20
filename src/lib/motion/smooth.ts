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

  let raf = 0;
  function frame(time: number) {
    lenis.raf(time);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  // In-page anchors have to go through Lenis or they fight it.
  function onClick(event: MouseEvent) {
    const link = (event.target as HTMLElement)?.closest?.('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href')!.slice(1);
    const target = id && document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target, { offset: 0 });
  }

  document.addEventListener('click', onClick);

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('click', onClick);
    lenis.destroy();
  };
}
