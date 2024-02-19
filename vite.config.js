import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
	publicDir: './public',
	plugins: [
		/* Uncomment the following line to enable solid-devtools.
           For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme */
		// devtools(),
		solidPlugin(),
	],
	root: './src',
	base: '/ext-config/devtools-panel/app',
	mode: 'development',
	build: {
		sourcemap: 'inline',
		outDir: '../ext-config/devtools-panel/app',
		assetsDir: './assets',
		emptyOutDir: true,
	},
});
