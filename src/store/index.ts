import type {Entry, GQLEntry, HAREntry, HTTPEntry} from '../types'
import type {Log as _Log} from "har-format";
import {createSignal} from "solid-js";
import {createStore} from "solid-js/store";

// export const entries:Array<Entry | Entry[]> = []

export interface Log extends _Log {
  entries: HAREntry[]
}
export const [entries, setEntries] = createStore<Array<Entry>>([]);
