<script lang="ts">
	import { formatRelative } from 'date-fns/formatRelative';
	import clsx from 'clsx';

	import type { RequestItem } from './types';
	import { badgeClassForStatusCode } from './utils';

	type Props = {
		requestItems: RequestItem[];
		setCurrentRequestItem: (requestItem: RequestItem) => void;
		currentRequestItem: RequestItem | null;
	};
	let { requestItems, setCurrentRequestItem, currentRequestItem }: Props = $props();

	$effect(() => {
		if (!currentRequestItem) return;
		document.querySelector(`[data-request-id="${currentRequestItem.id}"]`)?.scrollIntoView({ block: 'nearest' });
	});
</script>

<div class="grow overflow-y-auto">
	{#each requestItems as requestItem}
		<button
			onclick={() => setCurrentRequestItem(requestItem)}
			title={requestItem.name}
			data-request-id={requestItem.id}
			class={clsx('block text-left p-2', {
				'bg-zinc-700': requestItem.id === currentRequestItem?.id,
			})}
		>
			<span class="block mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{requestItem.name}</span>
			<span class="block mb-2 text-xs text-base-content/50">{requestItem.requestDomain}</span>
			<span class="flex flex-row items-center gap-2">
				<span class="badge badge-primary badge-xs font-mono">{requestItem.type}</span>
				<span class={clsx('badge badge-xs font-mono', badgeClassForStatusCode(requestItem.responseStatusCode))}>
					{requestItem.responseStatusCode}
				</span>
				<span class="badge badge-secondary badge-xs font-mono">{requestItem.method}</span>
				<span class="text-xs text-base-content/50">{formatRelative(new Date(requestItem.timestamp), new Date())}</span>
			</span>
		</button>
	{/each}
</div>
