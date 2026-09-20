<script lang="ts">
  /* A strip of text sliding past, forever.

     Sits between bands as a transition — it keeps the eye moving at
     the seam where a dark section meets a light one, which is the
     point in the page where scrolling otherwise feels like it stops.

     Duplicated content plus a 50% translate gives a seamless loop
     with no measurement and no JavaScript. */

  let {
    items,
    speed = 38,
    reverse = false,
  }: { items: string[]; speed?: number; reverse?: boolean } = $props();
</script>

<div class="marquee" style={`--speed:${speed}s`} aria-hidden="true">
  <div class="track" class:reverse>
    {#each [0, 1] as copy (copy)}
      <ul>
        {#each items as item (item)}
          <li>
            <span>{item}</span>
            <span class="dot">◆</span>
          </li>
        {/each}
      </ul>
    {/each}
  </div>
</div>

<style>
  .marquee {
    overflow: hidden;
    padding-block: var(--s-4);
    user-select: none;
    /* Fade both ends so the loop never shows a hard edge. */
    -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
    mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
  }

  .track {
    display: flex;
    width: max-content;
    animation: slide var(--speed) linear infinite;
  }

  .track.reverse { animation-direction: reverse; }
  .marquee:hover .track { animation-play-state: paused; }

  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    align-items: center;
    gap: var(--s-5);
    padding-right: var(--s-5);
    font-family: var(--font-display);
    font-size: var(--t-lg);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 350;
    white-space: nowrap;
    color: var(--ink-soft);
  }

  .dot { color: var(--accent); font-size: 0.5em; }

  @keyframes slide {
    from { transform: translate3d(0, 0, 0); }
    to   { transform: translate3d(-50%, 0, 0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .track { animation: none; }
  }
</style>
