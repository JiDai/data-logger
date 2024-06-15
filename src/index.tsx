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
	let responsePayload = null;
	try {
		responsePayload = typeof entry.response.getResponse === 'function' ? await entry.response.getResponse() : null;
	} catch (error) {
		console.warn(`Unable to get response body for entry: ${entry.id}`, error);
	}

	let requestType: RequestItem['type'] = 'Other';
	console.log('entry.response.mimeType: ', entry.response.mimeType);
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

	let data: RequestItem;
	if (requestType === 'GQL') {
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
			responseMimeType: e.response.mimeType,
		};
	} else {
		const e = entry as HTTPEntry;
		data = {
			id: e.id,
			timestamp: e.timestamp,
			name: e.request.name,
			type: requestType,
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
			responseMimeType: e.response.mimeType,
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
						if (isAcceptedEntry(parsedEntry)) {
							setEntries([...entries, await normalizeEntry(parsedEntry)]);
						}
					}
				} else {
					if (isAcceptedEntry(parsedEntries)) {
						setEntries([...entries, await normalizeEntry(parsedEntries)]);
					}
				}
			} else {
				// @ts-expect-error Incorrect types
				const parsed = parseHTTPEntry(harEntry);
				if (isAcceptedEntry(parsed)) {
					setEntries([...entries, await normalizeEntry(parsed)]);
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
						setEntries([...entries, await normalizeEntry(parsedEntry)]);
					}
				}
			} else {
				if (isAcceptedEntry(parsedEntries)) {
					setEntries([...entries, await normalizeEntry(parsedEntries)]);
				}
			}
		} else {
			const parsed = parseHTTPEntry(harEntry);
			if (isAcceptedEntry(parsed)) {
				setEntries([...entries, await normalizeEntry(parsed)]);
			}
		}
	});
}

render(() => <App />, root);
