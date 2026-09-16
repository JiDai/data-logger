<script lang="ts">
	import type { RequestItem } from './types';
	import clsx from 'clsx';
	import { badgeClassForStatusCode } from './utils';
	import type { FormEventHandler } from 'svelte/elements';

	type Props = {
		requestItem: RequestItem;
		responsePayloadHighlighted: string | null;
		responsePayloadJSONPathFilter: string | null;
		responsePayloadJSONChangeHandler: FormEventHandler<HTMLInputElement>;
	}
	let { requestItem, responsePayloadHighlighted, responsePayloadJSONPathFilter, responsePayloadJSONChangeHandler }: Props = $props();
</script>

<div class="basis-3/6 overflow-y-auto p-2">
	<h2 class="mb-4 text-lg">
		<span class="flex flex-row items-center gap-2">
			{requestItem.name}
			<span class="badge badge-primary font-mono">{requestItem.type}</span>
			<span class="badge badge-secondary font-mono">{requestItem.method}</span>
		</span>
		{#if requestItem.requestDomain}
			<span class="text-xs accent-gray-500">{requestItem.requestDomain}</span>
		{/if}
	</h2>
	<div class="mb-3">
		<h3 class="mb-2 text-base">Headers</h3>
		<table>
			<tbody>
			{#each requestItem.headers as header}
				<tr class="border-b border-solid border-gray-700">
					<td class="whitespace-nowrap py-1 pr-2 align-top">{header.name}</td>
					<td class="break-all">{header.value}</td>
				</tr>
			{/each}
			</tbody>
		</table>
	</div>
	{#if requestItem.requestQueryString}
		<div class="mb-3">
			<h3 class="mb-2 text-base">Query string</h3>
			<pre>
				<code class="hljs" contenteditable bind:innerHTML={requestItem.requestQueryStringCode}></code>
			</pre>
		</div>
	{/if}

	{#if requestItem.requestGQLQuery}
		<div class="mb-3">
			<h3 class="mb-2 text-base">GQL Query</h3>
			<pre>
				<code class="hljs" contenteditable bind:innerHTML={requestItem.requestGQLQueryCode}></code>
			</pre>
		</div>
	{/if}
	{#if requestItem.requestGQLVariables}
		<div class="mb-3">
			<h3 class="mb-2 text-base">GQL Variables</h3>
			<pre>
				<code class="hljs" contenteditable bind:innerHTML={requestItem.requestGQLVariablesCode}></code>
			</pre>
		</div>
	{/if}
	{#if requestItem.requestPostData}
		<div class="mb-3">
			<h3 class="mb-2 text-base">POST data</h3>
			<pre>
				<code class="hljs" contenteditable bind:innerHTML={requestItem.requestPostDataCode}></code>
			</pre>
		</div>
	{/if}
</div>

<div class="flex basis-3/6 flex-col overflow-y-auto border-l border-solid border-neutral">
	<div class="grow overflow-y-auto p-2">
		<h2 class="mb-4">
			<span class="mb-2 text-base flex items-center gap-2 flex-nowrap">
				<span class={clsx('badge font-mono', badgeClassForStatusCode(requestItem.responseStatusCode))}>
					{requestItem.responseStatusCode}
					{requestItem.responseStatusMessage}
				</span>
			</span>

			<span class="flex items-center gap-2">
				<span class="font-thin">{requestItem.time}ms</span>
				<span class="font-thin">{requestItem.responseMimeType}</span>
			</span>
		</h2>

		{#if ['JSON', 'GQL', 'XML'].includes(requestItem.type) && requestItem.responsePayload}
			<pre class="mt-0">
				<code class="hljs" contenteditable bind:innerHTML={responsePayloadHighlighted}></code>
			</pre>
		{/if}

		{#if requestItem.type === 'SVG'}
			<div>
				<div class="img-wrapper-background mb-3 flex max-w-full items-center justify-center p-4">
					<div contenteditable bind:innerHTML={requestItem.responsePayload as string}></div>
				</div>
				<h3 class="mb-2 text-base">Raw content</h3>
				<pre class="mt-0 max-w-full">
					<code class="hljs" contenteditable bind:innerHTML={responsePayloadHighlighted}></code>
				</pre>
			</div>
		{/if}

		{#if requestItem.type === 'IMG'}
			<div>
				<div class="img-wrapper-background mb-3 flex max-w-full items-center justify-center p-4">
					<img src={`data:${requestItem.responseMimeType};base64,${requestItem.responsePayload}`} alt="Preview of response" />
				</div>
			</div>
		{/if}
	</div>
	{#if requestItem.type === 'JSON'}
		<div class="mt-auto flex items-center justify-between border-t border-solid border-neutral bg-base-200">
			<input
				type="text"
				value={responsePayloadJSONPathFilter || ''}
				placeholder="Filter with JSONPath"
				class="bg-transparent p-2 outline-none ring-0"
				oninput={responsePayloadJSONChangeHandler}
			/>
			{#if responsePayloadJSONPathFilter}
				<button class="mr-2" onclick={() => (responsePayloadJSONPathFilter = '')} aria-label="Filter with JSONPath">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor" class="h-6 w-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
					</svg>
				</button>
			{/if}
		</div>
	{/if}
</div>
