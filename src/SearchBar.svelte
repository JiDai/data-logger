<script lang="ts">
	import { tick } from 'svelte';
	import clsx from 'clsx';
	import type { PanelSearch } from './lib/panelSearch.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		search: PanelSearch;
		label: string;
		leading?: Snippet;
	};
	let { search, label, leading }: Props = $props();

	let inputEl: HTMLInputElement | undefined = $state();

	async function handleToggle() {
		search.toggleOpen();
		if (search.open) {
			await tick();
			inputEl?.focus();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			search.close();
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (event.shiftKey) search.previous();
			else search.next();
		}
	}
</script>

<div class="absolute right-2 top-2 z-20 flex items-center gap-1">
	{#if !search.open}
		<button
			type="button"
			class="btn btn-circle btn-ghost btn-xs bg-base-200/80"
			onclick={handleToggle}
			aria-label={`Search in ${label}`}
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor" class="h-4 w-4">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
				/>
			</svg>
		</button>
	{:else}
		<div class="flex items-center gap-1 rounded-md border border-solid border-neutral bg-base-200 p-1 shadow-md">
			<input
				bind:this={inputEl}
				type="text"
				value={search.query}
				oninput={(event) => search.setQuery(event.currentTarget.value)}
				onkeydown={handleKeydown}
				placeholder="Find"
				aria-label={`Search in ${label}`}
				class={clsx('w-28 bg-transparent px-1 text-xs outline-none ring-0', search.invalidRegex && 'text-error')}
			/>
			<span class={clsx('min-w-8 whitespace-nowrap text-center text-[10px]', search.invalidRegex && 'text-error')}>
				{#if search.invalidRegex}
					invalid
				{:else}
					{search.matchCount > 0 ? search.currentIndex + 1 : 0}/{search.matchCount}
				{/if}
			</span>
			<button
				type="button"
				class={clsx('btn btn-ghost btn-xs px-1 font-mono', search.caseSensitive && 'btn-active')}
				onclick={() => search.toggleCaseSensitive()}
				aria-label="Match case"
				aria-pressed={search.caseSensitive}
				title="Match case"
			>
				Aa
			</button>
			<button
				type="button"
				class={clsx('btn btn-ghost btn-xs px-1 font-mono', search.useRegex && 'btn-active')}
				onclick={() => search.toggleRegex()}
				aria-label="Use regular expression"
				aria-pressed={search.useRegex}
				title="Use regular expression"
			>
				.*
			</button>
			<button
				type="button"
				class="btn btn-ghost btn-circle btn-xs"
				onclick={() => search.previous()}
				disabled={search.matchCount === 0}
				aria-label="Previous match"
				title="Previous match"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={2} stroke="currentColor" class="h-3.5 w-3.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
				</svg>
			</button>
			<button
				type="button"
				class="btn btn-ghost btn-circle btn-xs"
				onclick={() => search.next()}
				disabled={search.matchCount === 0}
				aria-label="Next match"
				title="Next match"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={2} stroke="currentColor" class="h-3.5 w-3.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
				</svg>
			</button>
			<button type="button" class="btn btn-ghost btn-circle btn-xs" onclick={() => search.close()} aria-label="Close search" title="Close search">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor" class="h-3.5 w-3.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
				</svg>
			</button>
		</div>
	{/if}
	{#if leading}{@render leading()}{/if}
</div>
