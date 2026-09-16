<script lang="ts">
	import type { RequestItem } from './types';
	import { buildCurlCommand, buildHarEntry, canCopyAsCurl, canCopyAsHar, canCopyUrl, writeToClipboard } from './lib/copyExport';

	type Props = {
		requestItem: RequestItem;
	};
	let { requestItem }: Props = $props();

	let copiedLabel: string | null = $state(null);
	let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

	async function copy(label: string, text: string) {
		const success = await writeToClipboard(text);
		copiedLabel = success ? label : null;
		clearTimeout(copiedTimeout);
		if (success) copiedTimeout = setTimeout(() => (copiedLabel = null), 1500);
		(document.activeElement as HTMLElement | null)?.blur();
	}

	function copyUrl() {
		copy('URL', requestItem.url);
	}

	function copyAsCurl() {
		copy('cURL', buildCurlCommand(requestItem));
	}

	function copyAsHar() {
		copy('HAR', JSON.stringify(buildHarEntry(requestItem), null, 2));
	}
</script>

<div class="dropdown dropdown-end">
	<button
		type="button"
		class="btn btn-circle btn-ghost btn-xs bg-base-200/80"
		aria-label="Copy request"
		title={copiedLabel ? `Copied ${copiedLabel}!` : 'Copy'}
	>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor" class="h-4 w-4">
			<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 8.25h15M4.5 15.75h15" />
		</svg>
	</button>
	<ul class="menu dropdown-content z-[1] w-56 rounded-box bg-base-100 p-2 text-xs shadow">
		<li>
			<button type="button" disabled={!canCopyUrl(requestItem)} onclick={copyUrl}> Copy full URL </button>
		</li>
		<li>
			<button type="button" disabled={!canCopyAsCurl(requestItem)} onclick={copyAsCurl}> Copy as cURL </button>
		</li>
		<li>
			<button type="button" disabled={!canCopyAsHar(requestItem)} onclick={copyAsHar}> Copy as HAR </button>
		</li>
	</ul>
</div>
