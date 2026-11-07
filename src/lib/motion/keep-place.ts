/* ---------------------------------------------------------------
   A refresh keeps you where you were.

   The browser's own restore can't be trusted here: held sections grow
   the page as they start up, and a #id left in the address (from "Back
   to the work") would send a refresh to that section instead. So the
   scroll position is written down per page when the page is left, and
   a real reload (normal or hard) puts it back. Page changes inside the
   site are not reloads and are left to the router and landOnHash.
   --------------------------------------------------------------- */

const key = () => `place:${location.pathname}${location.search}`;

/** Remember this page's scroll position whenever the tab leaves it. */
export function watchPlace() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  addEventListener('pagehide', () => {
    try {
      sessionStorage.setItem(key(), String(Math.round(scrollY)));
    } catch { /* storage blocked: a refresh starts at the top */ }
  });
}

/** True only when the current document was loaded by a refresh. */
export function wasReload() {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === 'reload';
}

/** The remembered position for this page, or null. */
export function savedPlace(): number | null {
  try {
    const raw = sessionStorage.getItem(key());
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}
