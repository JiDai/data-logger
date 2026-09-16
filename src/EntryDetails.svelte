<script lang="ts">
	import type { RequestItem } from './types';
	import clsx from 'clsx';
	import { badgeClassForStatusCode } from './utils';
	import type { FormEventHandler } from 'svelte/elements';
	import { PanelSearch } from './lib/panelSearch.svelte';
	import SearchBar from './SearchBar.svelte';
	import CopyMenu from './CopyMenu.svelte';
	import CopyIconButton from './CopyIconButton.svelte';
	import { formatRequestHeaders, formatRequestParams, getResponseBodyText } from './lib/copyExport';

	type Props = {
		requestItem: RequestItem;
		responsePayloadHighlighted: string | null;
		responsePayloadJSONPathFilter: string | null;
		responsePayloadJSONChangeHandler: FormEventHandler<HTMLInputElement>;
		isWatching: boolean;
		onToggleWatch: () => void;
	}
	let { requestItem, responsePayloadHighlighted, responsePayloadJSONPathFilter, responsePayloadJSONChangeHandler, isWatching, onToggleWatch }: Props = $props();

	const requestSearch = new PanelSearch();
	const responseSearch = new PanelSearch();
</script>

<div class="relative basis-3/6 overflow-hidden">
	<SearchBar search={requestSearch} label="request">
		{#snippet leading()}
			<CopyMenu {requestItem} />
		{/snippet}
	</SearchBar>
	<div class="h-full overflow-y-auto p-2" use:requestSearch.action>
	<h2 class="mb-4 text-lg">
		<span class="flex flex-row items-center gap-2">
			{requestItem.name}
			<span class="badge badge-primary font-mono">{requestItem.type}</span>
			<span class="badge badge-secondary font-mono">{requestItem.method}</span>
			<button
				type="button"
				class={clsx('btn btn-xs gap-1', isWatching ? 'btn-warning' : 'btn-outline')}
				onclick={onToggleWatch}
				title={isWatching
					? 'Stop watching this endpoint'
					: 'Watch this endpoint: filter the list to it and always show its most recent request'}
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor" class="h-3.5 w-3.5">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
					/>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
				</svg>
				{isWatching ? 'Watching' : 'Watch'}
			</button>
		</span>
		{#if requestItem.requestDomain}
			<span class="text-xs accent-gray-500">{requestItem.requestDomain}</span>
		{/if}
	</h2>
	<div class="mb-3">
		<h3 class="mb-2 flex items-center gap-1 text-base">
			Headers
			<CopyIconButton text={formatRequestHeaders(requestItem)} label="Copy request headers" />
		</h3>
		<table>
			<tbody>
			{#each requestItem.headers as header}
				<tr class="border-b border-solid border-gray-700">
					<td class="whitespace-nowrap py-1 pr-2 align-top">{header.name}</td>
					<td class="break-all">{header.value}</td>
					<td class="w-0 py-1 pl-1 align-top">
						<CopyIconButton text={header.value} label={`Copy value of ${header.name}`} />
					</td>
				</tr>
			{/each}
			</tbody>
		</table>
	</div>
	{#if requestItem.requestQueryString}
		<div class="mb-3">
			<h3 class="mb-2 text-base">Query string</h3>
			<div class="relative">
				<CopyIconButton
					text={requestItem.requestQueryString}
					label="Copy query string"
					class="absolute right-1 top-1 z-10 bg-base-200/80"
				/>
				<pre><code class="hljs" contenteditable bind:innerHTML={requestItem.requestQueryStringCode}></code></pre>
			</div>
		</div>
	{/if}

	{#if requestItem.requestGQLQuery}
		<div class="mb-3">
			<h3 class="mb-2 text-base">GQL Query</h3>
			<div class="relative">
				<CopyIconButton text={requestItem.requestGQLQuery} label="Copy GQL query" class="absolute right-1 top-1 z-10 bg-base-200/80" />
				<pre><code class="hljs" contenteditable bind:innerHTML={requestItem.requestGQLQueryCode}></code></pre>
			</div>
		</div>
	{/if}
	{#if requestItem.requestGQLVariables}
		<div class="mb-3">
			<h3 class="mb-2 text-base">GQL Variables</h3>
			<div class="relative">
				<CopyIconButton
					text={requestItem.requestGQLVariables}
					label="Copy GQL variables"
					class="absolute right-1 top-1 z-10 bg-base-200/80"
				/>
				<pre><code class="hljs" contenteditable bind:innerHTML={requestItem.requestGQLVariablesCode}></code></pre>
			</div>
		</div>
	{/if}
	{#if requestItem.requestPostData}
		<div class="mb-3">
			<h3 class="mb-2 text-base">POST data</h3>
			<div class="relative">
				<CopyIconButton text={requestItem.requestPostData} label="Copy POST data" class="absolute right-1 top-1 z-10 bg-base-200/80" />
				<pre><code class="hljs" contenteditable bind:innerHTML={requestItem.requestPostDataCode}></code></pre>
			</div>
		</div>
	{/if}
	{#if requestItem.requestParams}
		<div class="mb-3">
			<h3 class="mb-2 flex items-center gap-1 text-base">
				Form data
				<CopyIconButton text={formatRequestParams(requestItem)} label="Copy form data" />
			</h3>
			<table>
				<tbody>
				{#each requestItem.requestParams as param}
					<tr class="border-b border-solid border-gray-700 align-top">
						<td class="whitespace-nowrap py-1 pr-2 font-mono">{param.name}</td>
						<td class="break-all">
							{#if param.fileName}
								<span class="badge badge-outline font-mono">{param.fileName}</span>
								{#if param.contentType}<span class="ml-2 text-xs opacity-70">{param.contentType}</span>{/if}
							{:else}
								{param.value}
							{/if}
						</td>
					</tr>
				{/each}
				</tbody>
			</table>
		</div>
	{/if}
	</div>
</div>

<div class="flex basis-3/6 flex-col border-l border-solid border-neutral">
	<div class="relative grow overflow-hidden">
		<SearchBar search={responseSearch} label="response" />
		<div class="h-full overflow-y-auto p-2" use:responseSearch.action>
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
			<div class="relative">
				<CopyIconButton text={getResponseBodyText(requestItem) ?? ''} label="Copy response body" class="absolute right-1 top-1 z-10 bg-base-200/80" />
				<pre class="mt-0"><code class="hljs" contenteditable bind:innerHTML={responsePayloadHighlighted}></code></pre>
			</div>
		{/if}

		{#if requestItem.type === 'SVG'}
			<div>
				<div class="img-wrapper-background mb-3 flex max-w-full items-center justify-center p-4">
					<div contenteditable bind:innerHTML={requestItem.responsePayload as string}></div>
				</div>
				<h3 class="mb-2 text-base">Raw content</h3>
				<div class="relative">
					<CopyIconButton
						text={getResponseBodyText(requestItem) ?? ''}
						label="Copy response body"
						class="absolute right-1 top-1 z-10 bg-base-200/80"
					/>
					<pre class="mt-0 max-w-full"><code class="hljs" contenteditable bind:innerHTML={responsePayloadHighlighted}></code></pre>
				</div>
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
