<script lang="ts">
  import type {PageData} from './$types';
  import Logout from '$components/logout.svelte';

  export let data: PageData;
</script>

<h1>{data.heading}</h1>

<p>
  Logged in as: <strong>{data.user?.name}</strong>
  (<code>{data.user?.id}@{data.user?.provider}</code>)
</p>

<Logout />
