<script lang="ts">
	import type { RequestItem } from './types';
	import {
		buildCurlCommand,
		buildHarEntry,
		canCopyAsCurl,
		canCopyAsHar,
		canCopyRequestHeaders,
		canCopyResponseBody,
		formatRequestHeaders,
		getResponseBodyText,
	} from './lib/copyExport';

	type Props = {
		requestItem: RequestItem;
	};
	let { requestItem }: Props = $props();

	let copiedLabel: string | null = $state(null);
	let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

	async function writeToClipboard(text: string): Promise<boolean> {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch (error) {
			console.warn('navigator.clipboard.writeText failed, falling back to execCommand', error);
		}

		try {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.focus();
			textarea.select();
			const success = document.execCommand('copy');
			document.body.removeChild(textarea);
			return success;
		} catch (error) {
			console.warn('Fallback clipboard copy failed', error);
			return false;
		}
	}

	async function copy(label: string, text: string) {
		const success = await writeToClipboard(text);
		copiedLabel = success ? label : null;
		clearTimeout(copiedTimeout);
		if (success) copiedTimeout = setTimeout(() => (copiedLabel = null), 1500);
		(document.activeElement as HTMLElement | null)?.blur();
	}

	function copyAsCurl() {
		copy('cURL', buildCurlCommand(requestItem));
	}

	function copyAsHar() {
		copy('HAR', JSON.stringify(buildHarEntry(requestItem), null, 2));
	}

	function copyRequestHeaders() {
		copy('headers', formatRequestHeaders(requestItem));
	}

	function copyResponseBody() {
		const text = getResponseBodyText(requestItem);
		if (text !== null) copy('response body', text);
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
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
			/>
		</svg>
	</button>
	<ul class="menu dropdown-content z-[1] w-56 rounded-box bg-base-100 p-2 text-xs shadow">
		<li>
			<button type="button" disabled={!canCopyAsCurl(requestItem)} onclick={copyAsCurl}> Copy as cURL </button>
		</li>
		<li>
			<button type="button" disabled={!canCopyAsHar(requestItem)} onclick={copyAsHar}> Copy as HAR </button>
		</li>
		<li>
			<button type="button" disabled={!canCopyRequestHeaders(requestItem)} onclick={copyRequestHeaders}> Copy request headers </button>
		</li>
		<li>
			<button type="button" disabled={!canCopyResponseBody(requestItem)} onclick={copyResponseBody}> Copy response body </button>
		</li>
	</ul>
</div>
