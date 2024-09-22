import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte()],
	base: '/ext-config/devtools-panel/app',
	build: {
		outDir: './ext-config/devtools-panel/app',
	},
});
