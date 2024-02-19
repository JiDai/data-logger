import { Component, createEffect, createSignal } from "solid-js";
import * as prettier from "prettier";
import parserGraphql from "prettier/plugins/graphql";
import hljs from "highlight.js/lib/core";
import gqlLanguage from "highlight.js/lib/languages/graphql.js";
import jsonLanguage from "highlight.js/lib/languages/json";
import { formatRelative } from "date-fns/formatRelative";

import * as store from "./store";
import { Entry, GQLEntry, HTTPEntry } from "./types";

import "highlight.js/styles/atom-one-dark.css";
import { Header } from "har-format";
import { isGQLEntry } from "./utils";
import clsx from "clsx";

hljs.registerLanguage("graphql", gqlLanguage);
hljs.registerLanguage("json", jsonLanguage);

type RequestItem = {
	id: string;
	timestamp: number;
	name: string;
	type: string;
	method: string;
	headers: Array<Header>;
	requestQueryString: string;
	requestGQLQuery: string;
	requestGQLVariables: string;
	requestPostData: string;
	responsePayload: string;
};

async function normalizeEntry(entry: Entry): Promise<RequestItem> {
	let response = null;
	try {
		response = typeof entry.response.getResponse === "function" ? await entry.response.getResponse() : null;
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
			type: "GQL",
			method: e.request.method,
			headers: e.request.headers,
			requestQueryString: null,
			requestGQLQuery: await prettier.format(entry.request.query, { semi: false, parser: "graphql", plugins: [parserGraphql] }),
			requestGQLVariables: JSON.stringify(e.request.variables, null, 3),
			requestPostData: null,
			responsePayload: response ? JSON.stringify(response, null, 3) : "No response",
		};
	} else {
		const e = entry as HTTPEntry;
		data = {
			id: e.id,
			timestamp: e.timestamp,
			name: e.request.name,
			type: "XHR",
			method: e.request.method,
			headers: e.request.headers,
			requestQueryString: JSON.stringify(e.request.query, null, 3),
			requestGQLQuery: null,
			requestGQLVariables: null,
			requestPostData: JSON.stringify(e.request.body, null, 3),
			responsePayload: response ? JSON.stringify(response, null, 3) : "No response",
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
			<div class="flex flex-row items-stretch gap-x-2 h-full">
				<div class="flex basis-[20rem] flex-col border-r border-solid border-accent w-[20rem]">
					<div class="grow overflow-y-auto">
						{getEntries()
							.sort((a, b) => b.timestamp - a.timestamp)
							.map((entry) => {
								return (
									<button
										class={clsx("w-full text-sm text-left p-2 hover:bg-base-300/50", {
											"bg-base-300": entry.id === getSelectedEntry()?.id,
										})}
										onClick={() => setSelectedEntry(entry)}
										title={entry.name}
									>
										<div class="whitespace-nowrap overflow-hidden text-ellipsis mb-2">{entry.name}</div>
										<div class="flex flex-row gap-2 items-center">
											<div class="badge badge-xs badge-primary">{entry.type}</div>
											<div class="badge badge-xs badge-secondary">{entry.method}</div>
											<div class="text-xs text-base-content/50">{formatRelative(new Date(entry.timestamp), new Date())}</div>
										</div>
									</button>
								);
							})}
					</div>
					<div class="border-t border-solid border-neutral p-2 bg-base-200 mt-auto">
						<button class="btn btn-neutral btn-xs" onClick={clearList}>
							Clear
						</button>
					</div>
				</div>

				{getSelectedEntry() ? (
					<>
						<div class="border-r border-solid border-accent p-2 basis-3/6 overflow-y-auto">
							<div class="text-gray-500 italic mb-2">{getSelectedEntry().name}</div>
							<div class="mb-3">
								<h2 class="text-sm mb-2">Headers</h2>
								<table>
									{getSelectedEntry().headers.map((header) => {
										return (
											<tr class="border-gray-700 border-solid border-b">
												<td class="align-top py-1 pr-2 whitespace-nowrap">{header.name}</td>
												<td class="break-all">{header.value}</td>
											</tr>
										);
									})}
								</table>
							</div>
							{getSelectedEntry().requestQueryString && (
								<div class="mb-3">
									<h2 class="text-sm mb-2">Query string</h2>
									<pre>
										<code class="hljs" innerHTML={hljs.highlight(getSelectedEntry().requestQueryString, { language: "json" }).value}></code>
									</pre>
								</div>
							)}
							{getSelectedEntry().requestGQLQuery && (
								<div class="mb-3">
									<h2 class="text-sm mb-2">GQL Query</h2>
									<pre>
										<code class="hljs" innerHTML={hljs.highlight(getSelectedEntry().requestGQLQuery, { language: "graphql" }).value}></code>
									</pre>
								</div>
							)}
							{getSelectedEntry().requestGQLVariables && (
								<div class="mb-3">
									<h2 class="text-sm mb-2">GQL Variables</h2>
									<pre>
										<code class="hljs" innerHTML={hljs.highlight(getSelectedEntry().requestGQLVariables, { language: "json" }).value}></code>
									</pre>
								</div>
							)}
							{getSelectedEntry().requestPostData && (
								<div class="mb-3">
									<h2 class="text-sm mb-2">POST data</h2>
									<pre>
										<code class="hljs" innerHTML={hljs.highlight(getSelectedEntry().requestPostData, { language: "json" }).value}></code>
									</pre>
								</div>
							)}
						</div>

						<div class="flex flex-col basis-3/6 overflow-y-auto">
							<div class="grow overflow-y-auto p-2">
								{getSelectedEntry().responsePayload && (
									<pre>
										<code class="hljs" innerHTML={getResponsePayload()}></code>
									</pre>
								)}
							</div>
							<div class="border-t border-solid border-neutral bg-base-200 mt-auto flex items-center justify-between">
								<input
									type="text"
									value={getResponsePayloadJSONPathFilter()}
									placeholder="Filter with JSONPath"
									class="p-2 bg-transparent outline-none ring-0"
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
											class="w-6 h-6"
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
