<script lang="ts">
  /* Prose with nothing else. The default when an answer is just words. */
  import type { Entry } from '../../lib/brain/types';
  let { entry }: { entry: Entry } = $props();
</script>

<div class="prose">{@html entry.html}</div>
