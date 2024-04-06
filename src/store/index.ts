import { createStore } from 'solid-js/store';

import type { RequestItem } from '../types';

export const [entries, setEntries] = createStore<Array<RequestItem>>([]);
