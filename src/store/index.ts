import { get, writable } from 'svelte/store';
import jp from 'jsonpath';
import type { RequestItem } from '../types';
import { formatAndHighlight, watchKeyForRequestItem } from '../utils';

/*
 * All request items Store
 */
export const entries = writable<RequestItem[]>([]);
entries.subscribe((value) => {
	console.log(value);
});

export const empty = function () {
	entries.set([]);
};

export const append = function (entry: RequestItem) {
	entries.update((entries: RequestItem[]) => {
		return [...entries, entry].sort((a, b) => b.timestamp - a.timestamp);
	});
};

/*
 * Current viewed request item Store
 */
export const responsePayloadJSONPathFilter = writable<string | null>(null);
export const setResponsePayloadJSONPathFilter = async function (filter: string) {
	responsePayloadJSONPathFilter.set(filter);
};
export const responsePayloadHighlighted = writable<string | null>(null);
export const setResponsePayloadHighlighted = function (payload: string) {
	responsePayloadHighlighted.set(payload);
};

export const currentRequestItem = writable<RequestItem | null>(null);
export const setCurrentRequestItem = async function (requestItem: RequestItem) {
	let payload: unknown = '';
	switch (requestItem.type) {
		case 'JSON': {
			const jsonPathFilter = get(responsePayloadJSONPathFilter);
			console.log('responsePayloadJSONPathFilter: ', jsonPathFilter);
			if (requestItem.responsePayload && jsonPathFilter) {
				try {
					payload = jp.query(requestItem.responsePayload, jsonPathFilter);
				} catch (error) {
					console.error('jsonpath error', error);
				}
			} else if (requestItem.responsePayload) {
				payload = requestItem.responsePayload;
			}

			setResponsePayloadHighlighted((await formatAndHighlight(payload, 'json')) || '');
			break;
		}
		case 'GQL':
			setResponsePayloadHighlighted((await formatAndHighlight(requestItem.responsePayload ?? '', 'json')) || '');
			break;
		case 'SVG':
		case 'XML':
			setResponsePayloadHighlighted((await formatAndHighlight(requestItem.responsePayload ?? '', 'xml')) || '');
			break;
		case 'HTML':
			setResponsePayloadHighlighted((await formatAndHighlight(requestItem.responsePayload ?? '', 'html')) || '');
			break;
		default:
			setResponsePayloadHighlighted(typeof requestItem.responsePayload === 'string' ? requestItem.responsePayload : '');
			break;
	}
	currentRequestItem.set(requestItem);
};

/*
 * Endpoint URL filter Store
 */
export const endpointUrlFilter = writable<string>('');
export const setEndpointUrlFilter = function (value: string) {
	endpointUrlFilter.set(value);
};

/*
 * Settings Store
 */

type Settings = {
	filters: { GQL: boolean; JSON: boolean; XML: boolean; Img: boolean; Other: boolean };
};
const defaultSettings = {
	filters: { GQL: true, JSON: true, XML: true, Img: true, Other: true },
};
export const settings = writable<Settings>(defaultSettings);
export const setSettings = async function (value: Settings) {
	settings.set(value);
};

/*
 * Watched request Store
 *
 * Watching a request item locks the list to requests with the same method and URL
 * (including query string, when present) and keeps the most recent matching request
 * selected, so you can keep coding against that call and see its latest response land.
 */
export const watchedEndpointKey = writable<string | null>(null);
export const watchedRequestLabel = writable<string | null>(null);

export const watchRequestItem = function (requestItem: RequestItem) {
	const key = watchKeyForRequestItem(requestItem);
	watchedEndpointKey.set(key);
	watchedRequestLabel.set(`${requestItem.method.toUpperCase()} ${requestItem.url}`);

	const latest = get(entries).find((item) => watchKeyForRequestItem(item) === key);
	if (latest) {
		setCurrentRequestItem(latest);
	}
};

export const unwatchEndpoint = function () {
	watchedEndpointKey.set(null);
	watchedRequestLabel.set(null);
};

entries.subscribe((items) => {
	const key = get(watchedEndpointKey);
	if (!key) return;

	const latest = items.find((item) => watchKeyForRequestItem(item) === key);
	if (latest && latest.id !== get(currentRequestItem)?.id) {
		setCurrentRequestItem(latest);
	}
});
