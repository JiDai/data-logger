/* @refresh reload */
import * as prettier from 'prettier';
import parserGraphql from 'prettier/plugins/graphql';
import { render } from 'solid-js/web';

import App from './app';
import './index.css';
import { entries, setEntries } from './store';
import { fixtures } from './store/fixtures';
import { Entry, GQLEntry, HAREntry, HTTPEntry, RequestItem } from './types';
import { isGQLEntry, isGraphQL, parseGQLEntry, parseHTTPEntry } from './utils';

const root = document.getElementById('root');

if (!(root instanceof HTMLElement)) {
	throw new Error('Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?');
}

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function normalizeEntry(entry: Entry): Promise<RequestItem> {
	let responsePayload = null;
	try {
		responsePayload = typeof entry.response.getResponse === 'function' ? await entry.response.getResponse() : null;
	} catch (error) {
		console.warn(`Unable to get response body for entry: ${entry.id}`, error);
	}

	console.log('entry.request: ', entry.request);
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
			time: e.time,
			requestDomain: e.request.url,
			requestQueryString: null,
			requestGQLQuery: await prettier.format(e.request.query, {
				semi: false,
				parser: 'graphql',
				plugins: [parserGraphql],
			}),
			requestGQLVariables: JSON.stringify(e.request.variables, null, 3),
			requestPostData: null,
			responseStatusCode: e.response.status,
			responseStatusMessage: e.response.statusMessage,
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
			time: e.time,
			requestDomain: e.request.url.replace(new RegExp(`${escapeRegExp(e.request.pathname)}.*`), ''),
			requestQueryString: JSON.stringify(e.request.query, null, 3),
			requestGQLQuery: null,
			requestGQLVariables: null,
			requestPostData: JSON.stringify(e.request.body, null, 3),
			responseStatusCode: e.response.status,
			responseStatusMessage: e.response.statusMessage,
			responsePayload: responsePayload ? responsePayload : 'No response',
		};
	}
	return data;
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
						if (parsedEntry.request.method !== 'OPTIONS') setEntries([...entries, await normalizeEntry(parsedEntry)]);
					}
				} else {
					if (parsedEntries.request.method !== 'OPTIONS') setEntries([...entries, await normalizeEntry(parsedEntries)]);
				}
			} else {
				//  if (isHTTP(harEntry)) not working on firefox
				// @ts-expect-error Incorrect types
				const parsed = parseHTTPEntry(harEntry);
				if (parsed.request.method !== 'OPTIONS') setEntries([...entries, await normalizeEntry(parsed)]);
			}
		}
	})();
} else {
	// @ts-expect-error Incorrect types
	browser.devtools.network.onRequestFinished.addListener(async (harEntry: HAREntry) => {
		console.log('harEntry: ', harEntry);
		if (isGraphQL(harEntry)) {
			const parsedEntries = await parseGQLEntry(harEntry);
			if (Array.isArray(parsedEntries)) {
				for (const parsedEntry of parsedEntries) {
					if (parsedEntry.request.method !== 'OPTIONS') setEntries([...entries, await normalizeEntry(parsedEntry)]);
				}
			} else {
				if (parsedEntries.request.method !== 'OPTIONS') setEntries([...entries, await normalizeEntry(parsedEntries)]);
			}
		} else {
			//  if (isHTTP(harEntry)) not working on firefox
			const parsed = parseHTTPEntry(harEntry);
			if (parsed.request.method !== 'OPTIONS') setEntries([...entries, await normalizeEntry(parsed)]);
		}
	});
}

render(() => <App />, root);
