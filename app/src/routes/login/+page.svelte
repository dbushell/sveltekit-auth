<script lang="ts">
  import type {PageData} from './$types';

  export let data: PageData;
</script>

<h1>{data.heading}</h1>

{#if data.error}
  <p><strong>{data.error}</strong></p>
{/if}

<form action="/auth/github/login" method="POST">
  <button type="submit">
    <span>Login with GitHub</span>
  </button>
</form>
