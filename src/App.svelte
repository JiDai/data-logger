<script lang="ts">
	import hljs from 'highlight.js/lib/core';
	import gqlLanguage from 'highlight.js/lib/languages/graphql.js';
	import jsonLanguage from 'highlight.js/lib/languages/json';
	import xmlLanguage from 'highlight.js/lib/languages/xml';
	import 'highlight.js/styles/atom-one-dark.css';

	import * as prettier from 'prettier';
	import parserGraphql from 'prettier/plugins/graphql';
	import {
		append,
		responsePayloadHighlighted,
		responsePayloadJSONPathFilter,
		setResponsePayloadJSONPathFilter,
		settings,
		endpointUrlFilter,
		setEndpointUrlFilter,
		watchedEndpointKey,
		watchedRequestLabel,
		watchRequestItem,
		unwatchEndpoint,
	} from './store';
	import { fixtures } from './store/fixtures';
	import { entries, setCurrentRequestItem, currentRequestItem } from './store';
	import type { Entry, GQLEntry, HAREntry, HTTPEntry, RequestItem } from './types';
	import { endpointKeyForRequestItem, isGQLEntry, isGraphQL, parseGQLEntry, parseHTTPEntry, resolveResponseMimeType, watchKeyForRequestItem } from './utils';

	import RequestDetails from './EntryDetails.svelte';
	import RequestItemList from './RequestItemList.svelte';
	import type { FormEventHandler } from 'svelte/elements';
	import Settings from './Settings.svelte';

	hljs.registerLanguage('graphql', gqlLanguage);
	hljs.registerLanguage('json', jsonLanguage);
	hljs.registerLanguage('xml', xmlLanguage);

	const responsePayloadJSONChangeHandler: FormEventHandler<HTMLInputElement> = function (event) {
		console.log('responsePayloadJSONChangeHandler');
		if (!event.target) {
			return;
		}
		setResponsePayloadJSONPathFilter(event.currentTarget.value);
		if ($currentRequestItem) {
			setCurrentRequestItem($currentRequestItem);
		}
	};

	function escapeRegExp(string: string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	let endpointFilterInput: HTMLInputElement | undefined = $state();

	let filteredRequestItems = $derived(
		$watchedEndpointKey
			? $entries.filter((entry) => watchKeyForRequestItem(entry) === $watchedEndpointKey)
			: $entries
					.filter((entry) => {
						if (!$settings.filters.Img && !$settings.filters.GQL && !$settings.filters.JSON && !$settings.filters.XML && !$settings.filters.Other) {
							return true;
						}
						return (
							($settings.filters.Img && entry.type === 'IMG') ||
							($settings.filters.GQL && entry.type === 'GQL') ||
							($settings.filters.JSON && entry.type === 'JSON') ||
							($settings.filters.XML && entry.type === 'XML') ||
							($settings.filters.Other && entry.type === 'Other')
						);
					})
					.filter((entry) => {
						if (!$endpointUrlFilter) {
							return true;
						}
						const endpointUrl = endpointKeyForRequestItem(entry);
						return endpointUrl.includes($endpointUrlFilter.toLowerCase());
					}),
	);

	let isWatchingCurrent = $derived(
		$currentRequestItem !== null && $watchedEndpointKey === watchKeyForRequestItem($currentRequestItem),
	);

	function toggleWatchCurrent() {
		if (!$currentRequestItem) return;
		if (isWatchingCurrent) {
			unwatchEndpoint();
		} else {
			watchRequestItem($currentRequestItem);
		}
	}

	function isEditableTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === '/') {
			event.preventDefault();
			endpointFilterInput?.focus();
			endpointFilterInput?.select();
			return;
		}

		if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
			return;
		}
		if (isEditableTarget(event.target)) {
			return;
		}
		if (filteredRequestItems.length === 0) {
			return;
		}

		event.preventDefault();
		const currentIndex = $currentRequestItem ? filteredRequestItems.findIndex((item) => item.id === $currentRequestItem?.id) : -1;
		const nextIndex =
			event.key === 'ArrowDown'
				? currentIndex < 0
					? 0
					: Math.min(currentIndex + 1, filteredRequestItems.length - 1)
				: currentIndex < 0
					? 0
					: Math.max(currentIndex - 1, 0);

		const nextItem = filteredRequestItems[nextIndex];
		if (nextItem) {
			setCurrentRequestItem(nextItem);
		}
	}

	const acceptedMimeTypes = [/application\/json/, /text\/.*/, /image\/.*/];

	function isAcceptedEntry(entry: Entry) {
		const mimeType = resolveResponseMimeType({ url: entry.request.url, mimeType: entry.response.mimeType });
		return (
			entry.request.method !== 'OPTIONS' &&
			acceptedMimeTypes.findIndex((acceptedMimeTypeRegEx) => {
				return acceptedMimeTypeRegEx.test(mimeType);
			}) >= 0
		);
	}

	async function normalizeEntry(entry: Entry): Promise<RequestItem> {
		let responsePayload: unknown = null;
		try {
			responsePayload = typeof entry.response.getResponse === 'function' ? await entry.response.getResponse() : null;
		} catch (error) {
			console.warn(`Unable to get response body for entry: ${entry.id}`, error);
		}

		const responseMimeType = resolveResponseMimeType({ url: entry.request.url, mimeType: entry.response.mimeType });

		let requestType: RequestItem['type'] = 'Other';

		if (isGQLEntry(entry)) {
			requestType = 'GQL';
		} else if (/application\/json/.test(responseMimeType)) {
			requestType = 'JSON';
		} else if (/text\/html/.test(responseMimeType)) {
			requestType = 'XML';
		} else if (/text\/xml/.test(responseMimeType)) {
			requestType = 'XML';
		} else if (/image\/svg\+xml.*/.test(responseMimeType)) {
			requestType = 'SVG';
		} else if (/image\/.*/.test(responseMimeType)) {
			requestType = 'IMG';
		}

		let requestItem: RequestItem;
		if (requestType === 'GQL') {
			const e = entry as GQLEntry;
			requestItem = {
				id: e.id,
				timestamp: e.timestamp,
				name: `${e.request.operationType} ${e.request.name}`,
				type: 'GQL',
				method: e.request.method,
				url: e.request.url,
				headers: e.request.headers,
				responseHeaders: e.response.headers,
				time: e.time,
				requestDomain: e.request.url,
				requestQueryString: null,
				requestQueryStringCode: null,
				requestGQLQuery: await prettier.format(e.request.query, {
					semi: false,
					parser: 'graphql',
					plugins: [parserGraphql],
				}),
				requestGQLQueryCode: hljs.highlight(
					await prettier.format(e.request.query, {
						semi: false,
						parser: 'graphql',
						plugins: [parserGraphql],
					}),
					{ language: 'graphql' },
				).value,
				requestGQLVariables: JSON.stringify(e.request.variables, null, 3),
				requestGQLVariablesCode: hljs.highlight(JSON.stringify(e.request.variables, null, 3), { language: 'json' }).value,
				requestPostData: null,
				requestPostDataCode: null,
				requestParams: null,
				responseStatusCode: e.response.status,
				responseStatusMessage: e.response.statusMessage,
				responsePayload: responsePayload ? responsePayload : 'No response',
				responseMimeType,
			};
		} else {
			const e = entry as HTTPEntry;
			requestItem = {
				id: e.id,
				timestamp: e.timestamp,
				name: e.request.name,
				type: requestType,
				method: e.request.method,
				url: e.request.url,
				headers: e.request.headers,
				responseHeaders: e.response.headers,
				time: e.time,
				requestDomain: e.request.url.replace(new RegExp(`${escapeRegExp(e.request.pathname)}.*`), ''),
				requestQueryString: JSON.stringify(e.request.query, null, 3),
				requestQueryStringCode: hljs.highlight(JSON.stringify(e.request.query, null, 3), { language: 'json' }).value, // FIXME
				requestGQLQuery: null,
				requestGQLQueryCode: null,
				requestGQLVariables: null,
				requestGQLVariablesCode: null,
				requestPostData: e.request.body ? JSON.stringify(e.request.body, null, 3) : null,
				requestPostDataCode: e.request.body ? hljs.highlight(JSON.stringify(e.request.body, null, 3), { language: 'json' }).value : null,
				requestParams: e.request.params && e.request.params.length > 0 ? e.request.params : null,
				responseStatusCode: e.response.status,
				responseStatusMessage: e.response.statusMessage,
				responsePayload: responsePayload ? responsePayload : 'No response',
				responseMimeType,
			};
		}
		return requestItem;
	}

	if (import.meta.env.DEV) {
		(async function () {
			for (const harEntry of fixtures) {
				// @ts-expect-error Incorrect types
				if (isGraphQL(harEntry)) {
					// @ts-expect-error Incorrect types
					const parsedEntries = await parseGQLEntry(harEntry);
					if (Array.isArray(parsedEntries)) {
						for (const parsedEntry of parsedEntries) {
							if (isAcceptedEntry(parsedEntry)) {
								append(await normalizeEntry(parsedEntry));
							}
						}
					} else {
						if (isAcceptedEntry(parsedEntries)) {
							append(await normalizeEntry(parsedEntries));
						}
					}
				} else {
					// @ts-expect-error Incorrect types
					const parsed = parseHTTPEntry(harEntry);
					if (isAcceptedEntry(parsed)) {
						append(await normalizeEntry(parsed));
					}
				}
			}
		})();
	} else {
		// @ts-expect-error Incorrect types
		browser.devtools.network.onRequestFinished.addListener(async (harEntry: HAREntry) => {
			if (isGraphQL(harEntry)) {
				const parsedEntries = await parseGQLEntry(harEntry);
				if (Array.isArray(parsedEntries)) {
					for (const parsedEntry of parsedEntries) {
						if (isAcceptedEntry(parsedEntry)) {
							append(await normalizeEntry(parsedEntry));
						}
					}
				} else {
					if (isAcceptedEntry(parsedEntries)) {
						append(await normalizeEntry(parsedEntries));
					}
				}
			} else {
				const parsed = parseHTTPEntry(harEntry);
				console.log('parsed: ', parsed, isAcceptedEntry(parsed));
				if (isAcceptedEntry(parsed)) {
					append(await normalizeEntry(parsed));
				}
			}
		});
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<div class="h-full text-xs">
	<div class="flex h-full flex-row items-stretch gap-x-2">
		<div class="flex w-[16rem] shrink-0 basis-[16rem] bg-primary-content flex-col border-r border-solid border-neutral justify-between">
			<div class="flex items-center border-b border-solid border-neutral">
				{#if $watchedEndpointKey}
					<div class="flex w-full items-center gap-2 bg-warning/10 p-2">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor" class="h-4 w-4 shrink-0 text-warning">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
							/>
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
						</svg>
						<span class="grow overflow-hidden text-ellipsis whitespace-nowrap" title={$watchedRequestLabel}>
							Watching <span class="font-mono">{$watchedRequestLabel}</span>
						</span>
						<button class="mr-1 shrink-0" onclick={() => unwatchEndpoint()} aria-label="Stop watching" title="Stop watching">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor" class="h-4 w-4">
								<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
							</svg>
						</button>
					</div>
				{:else}
					<input
						bind:this={endpointFilterInput}
						type="text"
						value={$endpointUrlFilter}
						placeholder="Filter by endpoint URL"
						class="w-full bg-transparent p-2 text-xs outline-none ring-0"
						oninput={(event) => setEndpointUrlFilter(event.currentTarget.value)}
					/>
					{#if $endpointUrlFilter}
						<button class="mr-2" onclick={() => setEndpointUrlFilter('')} aria-label="Clear endpoint URL filter">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={1.5} stroke="currentColor" class="h-4 w-4">
								<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
							</svg>
						</button>
					{/if}
				{/if}
			</div>
			<RequestItemList requestItems={filteredRequestItems} {setCurrentRequestItem} currentRequestItem={$currentRequestItem} />

			<div class="flex items-center gap-2 mt-auto p-1 border-t border-solid border-neutral">
				<Settings />
			</div>
		</div>

		{#if $currentRequestItem}
			<RequestDetails
				requestItem={$currentRequestItem}
				responsePayloadHighlighted={$responsePayloadHighlighted}
				responsePayloadJSONPathFilter={$responsePayloadJSONPathFilter}
				{responsePayloadJSONChangeHandler}
				isWatching={isWatchingCurrent}
				onToggleWatch={toggleWatchCurrent}
			/>
		{/if}
	</div>
</div>
