<script lang="ts">
  /* The end of the page: what I'm looking for. The ways to reach me
     sit right below it, in the footer. */
  import Marker from './Marker.svelte';
</script>

<div class="page contact">
  <p class="label">Talk to me</p>

  <h2>Hiring for AI? <Marker>Let's talk.</Marker></h2>

  <p class="sub">
    I'm looking for an AI engineering role on a team that ships to real users.
    I'm in Mumbai, and open to remote work or moving for the right team. I'll
    tell you honestly whether I'm the right person, including when I'm not.
  </p>
</div>

<style>
  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2.25rem, 4.6vw + 1rem, 5.25rem);
    font-variation-settings: 'wght' 560;
    line-height: 0.98;
    letter-spacing: -0.035em;
    max-width: 12ch;
  }

  .sub {
    margin-top: var(--s-5);
    max-width: 42ch;
    font-size: var(--t-lg);
    color: var(--ink-soft);
  }
</style>
