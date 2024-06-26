import clsx from 'clsx';
import { formatRelative } from 'date-fns/formatRelative';
import hljs from 'highlight.js/lib/core';
import gqlLanguage from 'highlight.js/lib/languages/graphql.js';
import jsonLanguage from 'highlight.js/lib/languages/json';
import xmlLanguage from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css';
import jp from 'jsonpath';
import { Component, createEffect, createSignal } from 'solid-js';

import * as store from './store';
import { setSettings, settings } from './store';
import { RequestItem } from './types';
import { formatAndHighlight } from './utils';

hljs.registerLanguage('graphql', gqlLanguage);
hljs.registerLanguage('json', jsonLanguage);
hljs.registerLanguage('xml', xmlLanguage);

function clearList() {
	store.setEntries([]);
}

const App: Component = () => {
	const [getSelectedEntry, setSelectedEntry] = createSignal<RequestItem>(null);
	const [getResponsePayloadJSONPathFilter, setResponsePayloadJSONPathFilter] = createSignal(null);
	const [getResponsePayloadHighlighted, setResponsePayloadHighlighted] = createSignal(null);

	createEffect(async function () {
		let payload = '';
		switch (getSelectedEntry()?.type) {
			case 'JSON':
				if (getSelectedEntry()?.responsePayload && getResponsePayloadJSONPathFilter()) {
					try {
						payload = jp.query(getSelectedEntry()?.responsePayload, getResponsePayloadJSONPathFilter());
					} catch (error) {
						console.error('jsonpath error', error);
					}
				} else if (getSelectedEntry()?.responsePayload) {
					payload = getSelectedEntry().responsePayload;
				}

				setResponsePayloadHighlighted(await formatAndHighlight(payload, 'json'));
				break;
			case 'GQL':
				setResponsePayloadHighlighted(await formatAndHighlight(getSelectedEntry().responsePayload, 'json'));
				break;
			case 'SVG':
			case 'XML':
				setResponsePayloadHighlighted(await formatAndHighlight(getSelectedEntry()?.responsePayload, 'xml'));
				break;
			case 'HTML':
				setResponsePayloadHighlighted(await formatAndHighlight(getSelectedEntry()?.responsePayload, 'html'));
				break;
			default:
				setResponsePayloadHighlighted(getSelectedEntry()?.responsePayload);
				break;
		}
	});

	function responsePayloadJSONChangeHandler(event) {
		setResponsePayloadJSONPathFilter(event.target.value);
	}

	return (
		<div class="h-full text-xs">
			<div class="flex h-full flex-row items-stretch gap-x-2">
				<div class="flex w-[22rem] shrink-0 basis-[22rem] flex-col border-r border-solid border-neutral">
					<div class="grow overflow-y-auto">
						{store.entries
							.filter((entry) => {
								if (
									!settings.filters.Img &&
									!settings.filters.GQL &&
									!settings.filters.JSON &&
									!settings.filters.XML &&
									!settings.filters.Other
								) {
									return true;
								}
								return (
									(settings.filters.Img && entry.type === 'IMG') ||
									(settings.filters.GQL && entry.type === 'GQL') ||
									(settings.filters.JSON && entry.type === 'JSON') ||
									(settings.filters.XML && entry.type === 'XML') ||
									(settings.filters.Other && entry.type === 'Other')
								);
							})
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
										<div class="mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{entry.name}</div>
										<div class="mb-2 text-xs text-base-content/50">{entry.requestDomain}</div>
										<div class="flex flex-row items-center gap-2">
											<div class="badge badge-primary badge-xs font-mono">{entry.type}</div>
											<div class="badge badge-secondary badge-xs font-mono">{entry.method}</div>
											<div class="text-xs text-base-content/50">{formatRelative(new Date(entry.timestamp), new Date())}</div>
										</div>
									</button>
								);
							})}
					</div>
					<div class="mt-auto flex items-center justify-between border-t border-solid border-neutral bg-base-200 p-2">
						<div>
							<button class="btn btn-neutral btn-xs mr-2" onClick={clearList}>
								Clear
							</button>
							<div class="join">
								<input
									class="active btn join-item btn-neutral btn-xs mr-0.5"
									type="radio"
									name="filterRequestType"
									onClick={() =>
										setSettings({
											filters: { GQL: false, JSON: false, XML: false, Img: false, Other: false },
										})
									}
									aria-label="All"
								/>
								<input
									class="btn join-item btn-neutral btn-xs mr-0.5"
									type="radio"
									name="filterRequestType"
									onClick={() =>
										setSettings({
											filters: { GQL: true, JSON: false, XML: false, Img: false, Other: false },
										})
									}
									aria-label="GQL"
								/>
								<input
									class="btn join-item btn-neutral btn-xs mr-0.5"
									type="radio"
									name="filterRequestType"
									onClick={() =>
										setSettings({
											filters: { GQL: false, JSON: true, XML: false, Img: false, Other: false },
										})
									}
									aria-label="JSON"
								/>
								<input
									class="btn join-item btn-neutral btn-xs mr-0.5"
									type="radio"
									name="filterRequestType"
									onClick={() =>
										setSettings({
											filters: { GQL: false, JSON: false, XML: true, Img: false, Other: false },
										})
									}
									aria-label="XML"
								/>
								<input
									class="btn join-item btn-neutral btn-xs mr-0.5"
									type="radio"
									name="filterRequestType"
									onClick={() =>
										setSettings({
											filters: { GQL: false, JSON: false, XML: false, Img: true, Other: false },
										})
									}
									aria-label="Img"
								/>
								<input
									class="btn join-item btn-neutral btn-xs mr-0.5"
									type="radio"
									name="filterRequestType"
									onClick={() =>
										setSettings({
											filters: { GQL: false, JSON: false, XML: false, Img: false, Other: true },
										})
									}
									aria-label="Other"
								/>
							</div>
						</div>
					</div>
				</div>

				{getSelectedEntry() ? (
					<>
						<div class="basis-3/6 overflow-y-auto border-r border-solid border-neutral p-2">
							<h2 class="mb-4 text-lg">
								<div class="flex flex-row items-center gap-2 ">
									{getSelectedEntry().name}
									<div class="badge badge-primary font-mono">{getSelectedEntry().type}</div>
									<div class="badge badge-secondary font-mono">{getSelectedEntry().method}</div>
								</div>
								{getSelectedEntry().requestDomain && <span class="text-xs accent-gray-500">{getSelectedEntry().requestDomain}</span>}{' '}
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
									<span class="ml-3 font-thin">{getSelectedEntry().responseMimeType}</span>
								</h2>
								{['JSON', 'GQL', 'XML'].includes(getSelectedEntry().type) && getSelectedEntry().responsePayload && (
									<pre class="mt-0">
										<code class="hljs" innerHTML={getResponsePayloadHighlighted()}></code>
									</pre>
								)}
								{getSelectedEntry().type === 'SVG' && (
									<div>
										<div class="img-wrapper-background mb-3 flex max-w-full items-center justify-center p-4">
											<div innerHTML={getSelectedEntry().responsePayload}></div>
										</div>
										<h3 class="mb-2 text-base">Raw content</h3>
										<pre class="mt-0 max-w-full">
											<code class="hljs" innerHTML={getResponsePayloadHighlighted()}></code>
										</pre>
									</div>
								)}
								{getSelectedEntry().type === 'IMG' && (
									<div>
										<div class="img-wrapper-background mb-3 flex max-w-full items-center justify-center p-4 ">
											<img
												src={`data:${getSelectedEntry().responseMimeType};base64,${getSelectedEntry().responsePayload}`}
												alt="Preview image of response"
											/>
										</div>
									</div>
								)}
							</div>
							{getSelectedEntry().type === 'JSON' && (
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
							)}
						</div>
					</>
				) : null}
			</div>
		</div>
	);
};

export default App;
