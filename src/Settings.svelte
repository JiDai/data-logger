<script lang="ts">
	import { empty, setSettings, settings } from './store';
	import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
	import Fa from 'svelte-fa';
	import { get } from 'svelte/store';

	function clearList() {
		empty();
	}
</script>

<button class="btn btn-neutral btn-xs" onclick={clearList}> Clear </button>
<div class="dropdown dropdown-top">
	<button class="btn btn-neutral btn-xs">Filters</button>
	<ul class="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
		<li>
			<button
				class="form-control justify-between"

				onclick={() =>
					setSettings({
						filters: { GQL: false, JSON: false, XML: false, Img: false, Other: false },
					})}
			>
				<span class="label-text">All</span>
			</button>
		</li>
		<li>
			<button
				class="form-control justify-between"
				onclick={() =>
					setSettings({
						filters: { GQL: true, JSON: false, XML: false, Img: false, Other: false },
					})}
			>
				<span class="label-text">GQL</span>
				{#if $settings.filters.GQL}<Fa icon={faCheckCircle} class="text-amber-400" />{/if}
			</button>
		</li>
		<li>
			<button
				class="form-control justify-between"
				onclick={() =>
					setSettings({
						filters: { GQL: false, JSON: true, XML: false, Img: false, Other: false },
					})}
			>
				<span class="label-text">JSON</span>
				{#if $settings.filters.JSON}<Fa icon={faCheckCircle} class="text-amber-400" />{/if}
			</button>
		</li>
		<li>
			<button
				class="form-control justify-between"
				onclick={() =>
					setSettings({
						filters: { GQL: false, JSON: false, XML: true, Img: false, Other: false },
					})}
			>
				<span class="label-text">XML</span>
				{#if $settings.filters.XML}<Fa icon={faCheckCircle} class="text-amber-400" />{/if}
			</button>
		</li>
		<li>
			<button
				class="form-control justify-between"
				onclick={() =>
					setSettings({
						filters: { GQL: false, JSON: false, XML: false, Img: true, Other: false },
					})}
			>
				<span class="label-text">Img</span>
				{#if $settings.filters.Img}<Fa icon={faCheckCircle} class="text-amber-400" />{/if}
			</button>
		</li>
		<li>
			<button
				class="form-control justify-between"
				onclick={() =>
					setSettings({
						filters: { GQL: false, JSON: false, XML: false, Img: false, Other: true },
					})}
			>
				<span class="label-text">Other</span>
				{#if $settings.filters.Other}<Fa icon={faCheckCircle} class="text-amber-400" />{/if}
			</button>
		</li>
	</ul>
</div>
