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

Tip : Try GraphQL request with https://swapi-graphql.eskerda.vercel.app/


## Todo

- Feature #2: JSONPath, XPath selector or equivalent WIP
- Feature #3: Handle Multipart request
- Feature #4: Button to copy request headers, response, curl, ....
- Feature #5: Global search
- Feature #6: Create a component for smart tooltip
- Feature #7: Request watcher, pin a request and display automatically following same requests
