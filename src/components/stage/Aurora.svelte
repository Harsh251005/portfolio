<script lang="ts">
  /* ---------------------------------------------------------------
     The light behind the glass.

     Three large, heavily blurred colour fields drifting on long,
     mismatched cycles so the pattern never visibly repeats. This is
     what the panels refract; without it glass has nothing to pick up
     and reads as grey plastic.

     Done in CSS rather than canvas on purpose. The blur is rasterised
     once and every frame after that is a GPU transform, which is far
     cheaper than repainting a canvas each frame — and this sits under
     every backdrop-filter on the page, so it has to be cheap.

     It also drifts with scroll, at different rates per layer, so the
     page has depth behind it rather than a flat backdrop.
     --------------------------------------------------------------- */
  import { onMount } from 'svelte';

  let shiftA = $state(0);
  let shiftB = $state(0);
  let shiftC = $state(0);

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    function measure() {
      const y = scrollY;
      // Different rates per layer: that difference is the depth.
      shiftA = y * -0.12;
      shiftB = y * -0.05;
      shiftC = y * -0.19;
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    }

    measure();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  });
</script>

<div class="aurora" aria-hidden="true">
  <span class="blob blob--a" style={`--shift:${shiftA}px`}></span>
  <span class="blob blob--b" style={`--shift:${shiftB}px`}></span>
  <span class="blob blob--c" style={`--shift:${shiftC}px`}></span>
  <span class="vignette"></span>
</div>

<style>
  .aurora {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
    background: var(--paper);
  }

  .blob {
    position: absolute;
    display: block;
    border-radius: 50%;
    /* The blur is what makes these light rather than shapes. */
    filter: blur(90px);
    will-change: transform;
  }

  /* Sizes in vmax so the composition holds from phone to ultrawide. */
  .blob--a {
    width: 62vmax;
    height: 62vmax;
    left: -18vmax;
    top: -14vmax;
    background: var(--light-1);
    opacity: 0.2;
    animation: driftA 34s ease-in-out infinite alternate;
  }

  .blob--b {
    width: 74vmax;
    height: 74vmax;
    right: -26vmax;
    top: 6vmax;
    background: var(--light-2);
    opacity: 0.22;
    animation: driftB 46s ease-in-out infinite alternate;
  }

  .blob--c {
    width: 46vmax;
    height: 46vmax;
    left: 28vmax;
    bottom: -22vmax;
    background: var(--light-3);
    opacity: 0.13;
    animation: driftC 58s ease-in-out infinite alternate;
  }

  /* Darkens the edges so the centre reads as lit and text near the
     margins keeps its contrast. */
  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      120% 85% at 50% 40%,
      transparent 0%,
      color-mix(in oklab, var(--paper) 55%, transparent) 62%,
      var(--paper) 100%
    );
  }

  /* Each keyframe set carries the scroll shift through, so parallax
     and drift compose instead of one overwriting the other. */
  @keyframes driftA {
    from { transform: translate3d(0, var(--shift), 0) scale(1); }
    to   { transform: translate3d(14vmax, calc(var(--shift) + 10vmax), 0) scale(1.18); }
  }

  @keyframes driftB {
    from { transform: translate3d(0, var(--shift), 0) scale(1.1); }
    to   { transform: translate3d(-16vmax, calc(var(--shift) + 14vmax), 0) scale(0.92); }
  }

  @keyframes driftC {
    from { transform: translate3d(0, var(--shift), 0) scale(0.95); }
    to   { transform: translate3d(18vmax, calc(var(--shift) - 12vmax), 0) scale(1.25); }
  }

  @media (prefers-reduced-motion: reduce) {
    .blob { animation: none; }
  }
</style>
