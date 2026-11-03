<script lang="ts">
  /* The moonlit sea, fixed behind the whole page. Purely decoration, so it
     is hidden from assistive tech, and without script the page simply
     stays on its plain dark background. */
  import { onMount } from 'svelte';
  import { startSea } from '../../lib/scene/sea';

  let water: HTMLCanvasElement;
  let sky: HTMLCanvasElement;

  onMount(() => startSea(water, sky));
</script>

<div class="scene" aria-hidden="true">
  <canvas class="water" bind:this={water}></canvas>
  <canvas class="sky" bind:this={sky}></canvas>
</div>

<style>
  .scene {
    position: fixed;
    inset: 0 0 auto;
    height: 100lvh;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
  }

  canvas { position: absolute; left: 0; width: 100%; }
  .sky { top: 0; height: 100%; }
</style>
