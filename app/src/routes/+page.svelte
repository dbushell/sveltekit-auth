<script lang="ts">
  import type {PageData} from './$types';

  export let data: PageData;
</script>

<h1>{data.heading}</h1>

{#if data.user}
  <p><a href="/account">Account</a></p>
{:else}
  <p><a href="/login">Login</a></p>
{/if}

<p>
  <a href="https://github.com/dbushell/sveltekit-auth">GitHub</a>
</p>
