<script lang="ts">
  /* The person. A big opening line, then the short version. Photo
     lives in the hero; education has its own section. */
  import Marker from './Marker.svelte';
</script>

<div class="page about">
  <p class="label">About me</p>

  <h2>Commerce student. Karate gold medallist. <Marker>AI engineer.</Marker></h2>

  <div class="cols">
    <p>
      <strong>On paper, I was headed for balance sheets.</strong> I studied
      commerce in junior college. Off paper, I was building web pages, breaking
      them, and working out why they broke. By 2023 the habit had won, and I went
      to study IT instead.
    </p>
    <p>
      <strong>Then I pointed that habit at AI.</strong> A few months ago, and for
      the first time, I got serious. Now I build things that have to work with a
      real person on the other end: a receptionist that answers a clinic's phone,
      a coder that reads its own errors and knows when to stop.
    </p>
    <p>
      <strong>The gold came from the mat.</strong> I won it at the National Karate
      Championship, representing Maharashtra. Karate teaches what most AI demos
      skip: it only counts against someone who isn't cooperating. These days I play
      cricket, and I try to learn one small new thing every day.
    </p>
  </div>

  <a class="more" href="/ask/about-me">More about me <span aria-hidden="true">→</span></a>
</div>

<style>
  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2.25rem, 4.6vw + 1rem, 5.25rem);
    font-variation-settings: 'wght' 560;
    line-height: 0.98;
    letter-spacing: -0.035em;
    max-width: 16ch;
  }

  .cols {
    margin-top: var(--s-7);
    display: grid;
    gap: var(--s-6);
    font-size: var(--t-lg);
    line-height: 1.55;
    color: var(--ink-soft);
  }

  .cols p { max-width: 38ch; }

  strong {
    display: block;
    margin-bottom: var(--s-2);
    color: var(--ink);
    font-variation-settings: 'wght' 640;
  }

  .more {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    margin-top: var(--s-6);
    min-height: var(--tap);
    font-variation-settings: 'wght' 600;
    color: var(--ink);
    text-decoration-thickness: 2px;
    text-decoration-color: var(--accent);
    text-underline-offset: 0.3em;
  }

  .more:hover { color: var(--accent); }

  @media (width >= 60rem) {
    .cols { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-7); }
  }
</style>
