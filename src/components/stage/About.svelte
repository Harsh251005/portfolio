<script lang="ts">
  /* The person. A big opening line, then the short version. Photo
     lives in the hero now; this is just the story. */
  import Marker from './Marker.svelte';
  import Scan from './Scan.svelte';
  import Read from './Read.svelte';
</script>

<div class="page about">
  <Scan>
    <p class="label">About me</p>

    <h2>I didn't pick computers. <Marker>My school did.</Marker></h2>
  </Scan>

  <Scan delay={120}>
    <div class="cols">
      <Read
        text="Information Technology was a compulsory subject in 11th class, and it pulled me into web development. I wasn't serious about it. I kept trying things, breaking them, and working out why. A few months ago I pointed all of that at AI, and for the first time I got serious."
      />
      <Read
        text="I finished my degree in Information Technology in 2026. Away from the keyboard I play cricket, and I love it. I try to get a little better at something every day by learning one small new thing."
      />
    </div>
  </Scan>

  <a class="more" href="/ask/about-me">More about me <span aria-hidden="true">→</span></a>
</div>

<style>
  .about { max-width: 60rem; }

  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2.25rem, 4.6vw + 1rem, 5.25rem);
    font-variation-settings: 'opsz' 72, 'wght' 440, 'WONK' 1;
    line-height: 0.98;
    letter-spacing: -0.03em;
    max-width: 14ch;
  }

  .cols {
    margin-top: var(--s-7);
    display: grid;
    gap: var(--s-5);
    font-size: var(--t-lg);
    line-height: 1.55;
    color: var(--ink-soft);
  }

  .cols :global(p) { max-width: 36ch; }

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

  @media (width >= 56rem) {
    .cols { grid-template-columns: 1fr 1fr; gap: var(--s-8); }
  }
</style>
