<script lang="ts">
	import JsonNode from './JsonNode.svelte';

	type Props = {
		value: unknown;
		key?: string;
		isLast?: boolean;
	};
	let { value, key, isLast = true }: Props = $props();

	let open = $state(true);

	let isArray = $derived(Array.isArray(value));
	let isObject = $derived(value !== null && typeof value === 'object' && !isArray);
	let entries = $derived.by((): [string | undefined, unknown][] => {
		if (isArray) return (value as unknown[]).map((v) => [undefined, v]);
		if (isObject) return Object.entries(value as Record<string, unknown>);
		return [];
	});
	let isEmpty = $derived(entries.length === 0);
</script>

{#snippet keyLabel()}
	{#if key !== undefined}<span class="hljs-attr">"{key}"</span><span class="text-base-content/60">: </span>{/if}
{/snippet}

{#snippet trailingComma()}
	{#if !isLast}<span class="text-base-content/60">,</span>{/if}
{/snippet}

{#if isArray || isObject}
	{#if isEmpty}
		<div class="json-line">
			{@render keyLabel()}<span class="text-base-content/60">{isArray ? '[]' : '{}'}</span>{@render trailingComma()}
		</div>
	{:else}
		<details class="json-node" bind:open>
			<summary class="json-summary">
				{@render keyLabel()}<span class="text-base-content/60">{isArray ? '[' : '{'}</span>
				{#if !open}
					<span class="json-preview"
						>{entries.length}
						{isArray ? (entries.length === 1 ? 'item' : 'items') : entries.length === 1 ? 'key' : 'keys'}</span
					><span class="text-base-content/60">{isArray ? ']' : '}'}</span>{@render trailingComma()}
				{/if}
			</summary>
			<div class="json-children">
				{#each entries as [k, v], i (i)}
					<JsonNode value={v} key={k} isLast={i === entries.length - 1} />
				{/each}
			</div>
			<div class="json-line">
				<span class="text-base-content/60">{isArray ? ']' : '}'}</span>{@render trailingComma()}
			</div>
		</details>
	{/if}
{:else}
	<div class="json-line">
		{@render keyLabel()}
		{#if value === null}
			<span class="hljs-literal">null</span>
		{:else if typeof value === 'boolean'}
			<span class="hljs-literal">{value}</span>
		{:else if typeof value === 'number'}
			<span class="hljs-number">{value}</span>
		{:else if typeof value === 'string'}
			<span class="hljs-string">{JSON.stringify(value)}</span>
		{:else}
			<span class="hljs-literal">{JSON.stringify(value)}</span>
		{/if}{@render trailingComma()}
	</div>
{/if}
