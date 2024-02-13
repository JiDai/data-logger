/* @refresh reload */
import "./index.css";

import { render } from "solid-js/web";

import App from "./app";
import { isGraphQL, isHTTP, parseGQLEntry, parseHTTPEntry } from "./utils";

import { HAREntry } from "./types";
import { entries, setEntries } from "./store";

const root = document.getElementById("root");

if (!(root instanceof HTMLElement)) {
	throw new Error("Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?");
}

// @ts-expect-error Incorrect types
browser.devtools.network.onRequestFinished.addListener(async (harEntry: HAREntry) => {
	if (isGraphQL(harEntry)) {
		const parsedEntries = await parseGQLEntry(harEntry);
		if (Array.isArray(parsedEntries)) {
			for (const parsedEntry of parsedEntries) {
				if (parsedEntry.request.method !== "OPTIONS") setEntries([...entries, parsedEntry]);
			}
		} else {
			if (parsedEntries.request.method !== "OPTIONS") setEntries([...entries, parsedEntries]);
		}
	} else {
		//  if (isHTTP(harEntry)) not working on firefox
		const parsed = parseHTTPEntry(harEntry);
		console.log("harEntry: ", harEntry);
		if (parsed.request.method !== "OPTIONS") setEntries([...entries, parsed]);
	}
});

render(() => <App />, root);
