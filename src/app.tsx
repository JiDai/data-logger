import clsx from 'clsx';
import { formatRelative } from 'date-fns/formatRelative';
import { Header } from 'har-format';
import hljs from 'highlight.js/lib/core';
import gqlLanguage from 'highlight.js/lib/languages/graphql.js';
import jsonLanguage from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/atom-one-dark.css';
import jp from 'jsonpath';
import * as prettier from 'prettier';
import parserGraphql from 'prettier/plugins/graphql';
import { Component, JSX, createEffect, createSignal } from 'solid-js';

import * as store from './store';
import { Entry, GQLEntry, HTTPEntry } from './types';
import { isGQLEntry } from './utils';

hljs.registerLanguage('graphql', gqlLanguage);
hljs.registerLanguage('json', jsonLanguage);

type RequestItem = {
	id: string;
	timestamp: number;
	name: string;
	type: string;
	method: string;
	responseStatusCode: number;
	responseStatusMessage: string;
	time: number;
	headers: Array<Header>;
	requestQueryString: string;
	requestGQLQuery: string;
	requestGQLVariables: string;
	requestPostData: string;
	responsePayload: string;
};

function clearList() {
	store.setEntries([]);
}

async function normalizeEntry(entry: Entry): Promise<RequestItem> {
	let responsePayload = null;
	try {
		responsePayload = typeof entry.response.getResponse === 'function' ? await entry.response.getResponse() : null;
	} catch (error) {
		console.warn(`Unable to get response body for entry: ${entry.id}`, error);
	}

	let data: RequestItem;
	if (isGQLEntry(entry)) {
		const e = entry as GQLEntry;
		data = {
			id: e.id,
			timestamp: e.timestamp,
			name: `${e.request.operationType} ${e.request.name}`,
			type: 'GQL',
			method: e.request.method,
			headers: e.request.headers,
			time: entry.time,
			requestQueryString: null,
			requestGQLQuery: await prettier.format(entry.request.query, {
				semi: false,
				parser: 'graphql',
				plugins: [parserGraphql],
			}),
			requestGQLVariables: JSON.stringify(e.request.variables, null, 3),
			requestPostData: null,
			responseStatusCode: entry.response.status,
			responseStatusMessage: entry.response.statusMessage,
			responsePayload: responsePayload ? responsePayload : 'No response',
		};
	} else {
		const e = entry as HTTPEntry;
		data = {
			id: e.id,
			timestamp: e.timestamp,
			name: e.request.name,
			type: 'XHR',
			method: e.request.method,
			headers: e.request.headers,
			time: entry.time,
			requestQueryString: JSON.stringify(e.request.query, null, 3),
			requestGQLQuery: null,
			requestGQLVariables: null,
			requestPostData: JSON.stringify(e.request.body, null, 3),
			responseStatusCode: entry.response.status,
			responseStatusMessage: entry.response.statusMessage,
			responsePayload: responsePayload ? responsePayload : 'No response',
		};
	}
	return data;
}

const App: Component = () => {
	const [getEntries, setEntries] = createSignal([]);
	const [getSelectedEntry, setSelectedEntry] = createSignal(null);
	const [getResponsePayloadJSONPathFilter, setResponsePayloadJSONPathFilter] = createSignal(null);
	const [getResponsePayload, setResponsePayload] = createSignal(null);

	createEffect(async () => {
		const newEntries = [];
		for (const entry of store.entries) {
			newEntries.push(await normalizeEntry(entry));
		}
		setEntries(newEntries);
	});

	createEffect(function () {
		let payload = '';
		if (getSelectedEntry()?.responsePayload && getResponsePayloadJSONPathFilter()) {
			try {
				payload = jp.query(getSelectedEntry()?.responsePayload, getResponsePayloadJSONPathFilter());
			} catch (error) {
				console.log('jsonpath error', error);
			}
		} else if (getSelectedEntry()?.responsePayload) {
			payload = getSelectedEntry().responsePayload;
		}
		setResponsePayload(hljs.highlight(JSON.stringify(payload, null, 3), { language: 'json' }).value);
	});

	function responsePayloadJSONChangeHandler(event) {
		setResponsePayloadJSONPathFilter(event.target.value);
	}

	return (
		<div class="h-full text-xs">
			<div class="flex h-full flex-row items-stretch gap-x-2">
				<div class="flex w-[20rem] basis-[20rem] flex-col border-r border-solid border-neutral">
					<div class="grow overflow-y-auto">
						{getEntries()
							.sort((a, b) => b.timestamp - a.timestamp)
							.map((entry) => {
								return (
									<button
										class={clsx('w-full p-2 text-left text-sm hover:bg-accent/20', {
											'bg-accent/20': entry.id === getSelectedEntry()?.id,
										})}
										onClick={() => setSelectedEntry(entry)}
										title={entry.name}
									>
										<div class="mb-2 overflow-hidden text-ellipsis whitespace-nowrap">{entry.name}</div>
										<div class="flex flex-row items-center gap-2">
											<div class="badge badge-primary badge-xs font-mono">{entry.type}</div>
											<div class="badge badge-secondary badge-xs font-mono">{entry.method}</div>
											<div class="text-xs text-base-content/50">{formatRelative(new Date(entry.timestamp), new Date())}</div>
										</div>
									</button>
								);
							})}
					</div>
					<div class="mt-auto border-t border-solid border-neutral bg-base-200 p-2">
						<button class="btn btn-neutral btn-xs" onClick={clearList}>
							Clear
						</button>
					</div>
				</div>

				{getSelectedEntry() ? (
					<>
						<div class="basis-3/6 overflow-y-auto border-r border-solid border-neutral p-2">
							<h2 class="mb-4 flex flex-row items-center gap-2 text-lg">
								{getSelectedEntry().name}
								<div class="badge badge-primary font-mono">{getSelectedEntry().type}</div>
								<div class="badge badge-secondary font-mono">{getSelectedEntry().method}</div>
							</h2>
							<div class="mb-3">
								<h3 class="mb-2 text-base">Headers</h3>
								<table>
									{getSelectedEntry().headers.map((header) => {
										return (
											<tr class="border-b border-solid border-gray-700">
												<td class="whitespace-nowrap py-1 pr-2 align-top">{header.name}</td>
												<td class="break-all">{header.value}</td>
											</tr>
										);
									})}
								</table>
							</div>
							{getSelectedEntry().requestQueryString && (
								<div class="mb-3">
									<h3 class="mb-2 text-base">Query string</h3>
									<pre>
										<code class="hljs" innerHTML={hljs.highlight(getSelectedEntry().requestQueryString, { language: 'json' }).value}></code>
									</pre>
								</div>
							)}
							{getSelectedEntry().requestGQLQuery && (
								<div class="mb-3">
									<h3 class="mb-2 text-base">GQL Query</h3>
									<pre>
										<code class="hljs" innerHTML={hljs.highlight(getSelectedEntry().requestGQLQuery, { language: 'graphql' }).value}></code>
									</pre>
								</div>
							)}
							{getSelectedEntry().requestGQLVariables && (
								<div class="mb-3">
									<h3 class="mb-2 text-base">GQL Variables</h3>
									<pre>
										<code
											class="hljs"
											innerHTML={hljs.highlight(getSelectedEntry().requestGQLVariables, { language: 'json' }).value}
										></code>
									</pre>
								</div>
							)}
							{getSelectedEntry().requestPostData && (
								<div class="mb-3">
									<h3 class="mb-2 text-base">POST data</h3>
									<pre>
										<code class="hljs" innerHTML={hljs.highlight(getSelectedEntry().requestPostData, { language: 'json' }).value}></code>
									</pre>
								</div>
							)}
						</div>

						<div class="flex basis-3/6 flex-col overflow-y-auto">
							<div class="grow overflow-y-auto p-2">
								<h2 class="mb-4 text-base">
									<span
										class={clsx('badge font-mono', {
											'badge-error': getSelectedEntry().responseStatusCode >= 400,
											'badge-success': getSelectedEntry().responseStatusCode < 400,
										})}
									>
										{getSelectedEntry().responseStatusCode} {getSelectedEntry().responseStatusMessage}
									</span>
									<span class="ml-3 font-thin">{getSelectedEntry().time}ms</span>
								</h2>
								{getSelectedEntry().responsePayload && (
									<pre class="mt-0">
										<code class="hljs" innerHTML={getResponsePayload()}></code>
									</pre>
								)}
							</div>
							<div class="mt-auto flex items-center justify-between border-t border-solid border-neutral bg-base-200">
								<input
									type="text"
									value={getResponsePayloadJSONPathFilter()}
									placeholder="Filter with JSONPath"
									class="bg-transparent p-2 outline-none ring-0"
									onChange={responsePayloadJSONChangeHandler}
								/>
								{getResponsePayloadJSONPathFilter() && (
									<button class="mr-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width={1.5}
											stroke="currentColor"
											class="h-6 w-6"
											onClick={() => setResponsePayloadJSONPathFilter('')}
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
											/>
										</svg>
									</button>
								)}
							</div>
						</div>
					</>
				) : null}
			</div>
		</div>
	);
};

export default App;
