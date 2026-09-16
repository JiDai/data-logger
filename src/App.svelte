<script lang="ts">
	import hljs from 'highlight.js/lib/core';
	import gqlLanguage from 'highlight.js/lib/languages/graphql.js';
	import jsonLanguage from 'highlight.js/lib/languages/json';
	import xmlLanguage from 'highlight.js/lib/languages/xml';
	import 'highlight.js/styles/atom-one-dark.css';

	import * as prettier from 'prettier';
	import parserGraphql from 'prettier/plugins/graphql';
	import { append, responsePayloadHighlighted, responsePayloadJSONPathFilter, setResponsePayloadJSONPathFilter, settings } from './store';
	import { fixtures } from './store/fixtures';
	import { entries, setCurrentRequestItem, currentRequestItem } from './store';
	import type { Entry, GQLEntry, HAREntry, HTTPEntry, RequestItem } from './types';
	import { isGQLEntry, isGraphQL, parseGQLEntry, parseHTTPEntry } from './utils';

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

	const acceptedMimeTypes = [/application\/json/, /text\/.*/, /image\/.*/];

	function isAcceptedEntry(entry: Entry) {
		return (
			entry.request.method !== 'OPTIONS' &&
			acceptedMimeTypes.findIndex((acceptedMimeTypeRegEx) => {
				return acceptedMimeTypeRegEx.test(entry.response.mimeType);
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

		let requestType: RequestItem['type'] = 'Other';

		if (isGQLEntry(entry)) {
			requestType = 'GQL';
		} else if (/application\/json/.test(entry.response.mimeType)) {
			requestType = 'JSON';
		} else if (/text\/html/.test(entry.response.mimeType)) {
			requestType = 'XML';
		} else if (/text\/xml/.test(entry.response.mimeType)) {
			requestType = 'XML';
		} else if (/image\/svg\+xml.*/.test(entry.response.mimeType)) {
			requestType = 'SVG';
		} else if (/image\/.*/.test(entry.response.mimeType)) {
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
				headers: e.request.headers,
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
				responseStatusCode: e.response.status,
				responseStatusMessage: e.response.statusMessage,
				responsePayload: responsePayload ? responsePayload : 'No response',
				responseMimeType: e.response.mimeType,
			};
		} else {
			const e = entry as HTTPEntry;
			requestItem = {
				id: e.id,
				timestamp: e.timestamp,
				name: e.request.name,
				type: requestType,
				method: e.request.method,
				headers: e.request.headers,
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
				responseStatusCode: e.response.status,
				responseStatusMessage: e.response.statusMessage,
				responsePayload: responsePayload ? responsePayload : 'No response',
				responseMimeType: e.response.mimeType,
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

<div class="h-full text-xs">
	<div class="flex h-full flex-row items-stretch gap-x-2">
		<div class="flex w-[16rem] shrink-0 basis-[16rem] bg-primary-content flex-col border-r border-solid border-neutral justify-between">
			<RequestItemList requestItems={$entries.filter((entry) => {
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
				} {setCurrentRequestItem} currentRequestItem={$currentRequestItem} />

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
			/>
		{/if}
	</div>
</div>
