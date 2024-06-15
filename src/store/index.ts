import { createStore } from 'solid-js/store';

import type { RequestItem } from '../types';

type Settings = {
	filters: { GQL: boolean; JSON: boolean; XML: boolean; Img: boolean; Other: boolean };
};

export const [entries, setEntries] = createStore<Array<RequestItem>>([]);
export const [settings, setSettings] = createStore<Settings>({
	filters: { GQL: false, JSON: false, XML: false, Img: false, Other: false },
});
