import { get, writable } from 'svelte/store';
import jp from 'jsonpath';
import type { RequestItem } from '../types';
import { formatAndHighlight } from '../utils';

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
	let payload = '';
	switch (requestItem.type) {
		case 'JSON':
			console.log('responsePayloadJSONPathFilter: ', get(responsePayloadJSONPathFilter));
			if (requestItem.responsePayload && get(responsePayloadJSONPathFilter)) {
				try {
					payload = jp.query(requestItem.responsePayload, get(responsePayloadJSONPathFilter));
				} catch (error) {
					console.error('jsonpath error', error);
				}
			} else if (requestItem.responsePayload) {
				payload = requestItem.responsePayload;
			}

			setResponsePayloadHighlighted((await formatAndHighlight(payload, 'json')) || '');
			break;
		case 'GQL':
			setResponsePayloadHighlighted((await formatAndHighlight(requestItem.responsePayload, 'json')) || '');
			break;
		case 'SVG':
		case 'XML':
			setResponsePayloadHighlighted((await formatAndHighlight(requestItem.responsePayload, 'xml')) || '');
			break;
		case 'HTML':
			setResponsePayloadHighlighted((await formatAndHighlight(requestItem.responsePayload, 'html')) || '');
			break;
		default:
			setResponsePayloadHighlighted(requestItem.responsePayload);
			break;
	}
	currentRequestItem.set(requestItem);
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
