import parserGraphql from "prettier/plugins/graphql";
import parserEstree from "prettier/plugins/estree";
import prettier from "prettier/standalone";
import { Component, createEffect, createSignal, on } from "solid-js";
import hljs from "highlight.js/lib/core";
import gql from "highlight.js/lib/languages/graphql.js";

import { entries } from "./store";
import { Entry, GQLEntry, HTTPEntry } from "./types";
import "highlight.js/styles/atom-one-dark.css";

hljs.registerLanguage("graphql", gql);

async function normalizeEntry(entry: Entry) {
	const isGql = entry.type === "GQL";
	console.log("entry.request.query: ", entry.request.query);
	let data;
	try {
		const response = typeof entry.response.getResponse === "function" ? await entry.response.getResponse() : null;
		console.log("response: ", response);
		data = {
			name: isGql ? entry.request.operationType : entry.request.name,
			type: isGql ? "GQL" : "XHR",
			method: entry.request.method,
			headers: entry.request.headers,
			requestPayload: isGql ? await prettier.format(entry.request.query, { semi: false, parser: "graphql", plugins: [parserGraphql] }) : (entry as HTTPEntry).request.queryString,
			responsePayload: response ? await prettier.format(response, { semi: false, parser: "json", plugins: [parserEstree] }) : "No response",
		};
	} catch (e) {
		console.log("e: ", e);
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
		console.log("newEntries: ", newEntries);
		setEntries(newEntries);
	});

	createEffect(async () => {
		const selectedEntry = getEntries()[getSelectedIndex()];
		console.log("selectedEntry: ", selectedEntry);
		setSelectedEntry(selectedEntry);
	});

	return (
		<div class="container mx-auto h-full text-xs">
			<div class="flex flex-row items-stretch gap-x-2 h-full">
				<div class="basis-1/6 border-r border-solid border-accent p-2 max-w-80 overflow-y-auto">
					{getEntries().map((entry, index) => {
						return (
							<button class=" w-full text-sm mb-2 text-left" onClick={() => setSelectedIndex(index)}>
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
						<div class="border-r border-solid border-accent p-2 basis-2/6 overflow-y-auto">
							<div class="text-gray-500 italic mb-2">{getSelectedEntry().name}</div>
							<h2 class="text-sm mb-2">Headers</h2>
							<table>
								{getSelectedEntry().headers.map((header) => {
									return (
										<tr class="border-gray-700 border-solid border-b">
											<td class="align-top py-1 pr-2 whitespace-nowrap">{header.name}</td>
											<td>{header.value}</td>
										</tr>
									);
								})}
							</table>
							<h2 class="text-sm mb-2">Payload</h2>
							{console.log("getSelectedEntry().responsePayload: ", getSelectedEntry().responsePayload)}
							{getSelectedEntry().requestPayload && (
								<pre>
									<code class="hljs" innerHTML={hljs.highlight(getSelectedEntry().requestPayload, { language: "graphql" }).value}></code>
								</pre>
							)}
						</div>
						<div class="p-2 basis-3/6 overflow-y-auto">
							{getSelectedEntry().responsePayload && (
								<pre>
									<code class="hljs" innerHTML={hljs.highlight(getSelectedEntry().responsePayload, { language: "graphql" }).value}></code>
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
