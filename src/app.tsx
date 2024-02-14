import { Component, createEffect, createSignal, on } from "solid-js";
import * as prettier from "prettier";
import parserGraphql from "prettier/plugins/graphql";
import hljs from "highlight.js/lib/core";
import gqlLanguage from "highlight.js/lib/languages/graphql.js";
import jsonLanguage from "highlight.js/lib/languages/json";

import { entries } from "./store";
import { Entry, GQLEntry, HTTPEntry } from "./types";

import "highlight.js/styles/atom-one-dark.css";
import { Header } from "har-format";
import { isGQLEntry } from "./utils";

hljs.registerLanguage("graphql", gqlLanguage);
hljs.registerLanguage("json", jsonLanguage);

type RequestItem = {
	name: string;
	type: string;
	method: string;
	headers: Array<Header>;
	requestQueryString: string;
	requestGQLQuery: string;
	requestPostData: string;
	responsePayload: string;
};

async function normalizeEntry(entry: Entry): Promise<RequestItem> {
	const response = typeof entry.response.getResponse === "function" ? await entry.response.getResponse() : null;

	let data: RequestItem;
	if (isGQLEntry(entry)) {
		const e = entry as GQLEntry;
		data = {
			name: `${e.request.operationType} ${e.request.name}`,
			type: "GQL",
			method: e.request.method,
			headers: e.request.headers,
			requestQueryString: null,
			requestGQLQuery: await prettier.format(entry.request.query, { semi: false, parser: "graphql", plugins: [parserGraphql] }),
			requestPostData: null,
			responsePayload: response ? JSON.stringify(response, null, 3) : "No response",
		};
	} else {
		const e = entry as HTTPEntry;
		data = {
			name: e.request.name,
			type: "XHR",
			method: e.request.method,
			headers: e.request.headers,
			requestQueryString: JSON.stringify(e.request.query, null, 3),
			requestGQLQuery: null,
			requestPostData: JSON.stringify(e.request.body, null, 3),
			responsePayload: response ? JSON.stringify(response, null, 3) : "No response",
		};
	}
	return data;
}

const App: Component = () => {
	const [getEntries, setEntries] = createSignal([]);
	const [getSelectedIndex, setSelectedIndex] = createSignal(0);
	const [getSelectedEntry, setSelectedEntry] = createSignal(null);

	createEffect(async () => {
		const newEntries = [];
		for (const entry of entries) {
			newEntries.push(await normalizeEntry(entry));
		}
		setEntries(newEntries);
	});

	createEffect(async () => {
		const selectedEntry = getEntries()[getSelectedIndex()];
		setSelectedEntry(selectedEntry);
	});

	return (
		<div class="h-full text-xs">
			<div class="flex flex-row items-stretch gap-x-2 h-full">
				<div class="basis-1/6 border-r border-solid border-accent p-2 max-w-80 overflow-y-auto">
					{getEntries().map((entry, index) => {
						return (
							<button class=" w-full text-sm mb-2 text-left" onClick={() => setSelectedIndex(index)} title={entry.name}>
								<div class="whitespace-nowrap overflow-hidden text-ellipsis mb-2">{entry.name}</div>
								<div class="flex flex-row gap-2 items-center">
									<div class="badge badge-xs badge-primary">{entry.type}</div>
									<div class="badge badge-xs badge-secondary">{entry.method}</div>
								</div>
							</button>
						);
					})}
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
