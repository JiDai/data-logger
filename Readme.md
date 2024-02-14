# An addon to inspect all XHR/Fetch and graphql call

## Architecture

In `ext-config` folder you will find all the addon "core" files.

The `src` folder contains the sources files for the application of the devtools panel representing the main UI of the module.
The application is built on top of tailwind and daisyUI. Built files will take place on the `/ext-config/devtools-panel/app` folder.


## Install

`pnpm install`

## Build

`pnpm run build`

The build task will generate files in the `/ext-config/devtools-panel/app` folder to be used by the extensions as a devtools panel.

## Develop

`pnpm run dev`

Run a standalone app with fixtures (not working well).

`pnpm run build:watch`

The task will build with watching.

## Todo

- Use `formatData` to handle more response type
- Global search
- JSONPath, XPath selector or equivalent
- Filter on request list
