/* @refresh reload */
import './index.css';

import { render } from 'solid-js/web';

import App from './app';
import { isGraphQL, isHTTP, parseGQLEntry, parseHTTPEntry } from './utils'

import type { HAREntry } from './types'
import { entries, setEntries } from "./store";

const root = document.getElementById('root');

if (!(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}


// @ts-expect-error Incorrect types
browser.devtools.network.onRequestFinished.addListener(async (harEntry: HAREntry) => {
    if (isGraphQL(harEntry)) {
        const parsedEntries = await parseGQLEntry(harEntry)
        console.log('parsedEntries: ', parsedEntries)
        setEntries([
            ...entries,
            parsedEntries
        ])
    } else if (isHTTP(harEntry)) {
        const parsed = parseHTTPEntry(harEntry)

        setEntries([
            ...entries,
            parsed
        ])
    } else {
        console.log('plouf')
    }
})


render(
  () => (
      <App />
  ),
  root,
);
