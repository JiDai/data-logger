import { Component, createEffect, createSignal } from "solid-js";
import * as prettier from "prettier";
import parserGraphql from "prettier/plugins/graphql";
import hljs from "highlight.js/lib/core";
import gqlLanguage from "highlight.js/lib/languages/graphql.js";
import jsonLanguage from "highlight.js/lib/languages/json";

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

	createEffect(async () => {
		const newEntries = [];
		for (const entry of store.entries) {
			newEntries.push(await normalizeEntry(entry));
		}
		setEntries(newEntries);
	});

	function clearList() {
		store.setEntries([]);
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
										</div>
									</button>
								);
							})}
					</div>
					<div class="border-t border-solid border-neutral p-2 bg-base-200">
						<button class="btn btn-neutral btn-xs mt-auto" onClick={clearList}>
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

						<div class="p-2 basis-3/6 overflow-y-auto">
							{getSelectedEntry().responsePayload && (
								<pre>
									<code class="hljs" innerHTML={hljs.highlight(getSelectedEntry().responsePayload, { language: "json" }).value}></code>
								</pre>
							)}
						</div>
					</>
				) : null}
			</div>
		</div>
	);
};

export default App;
