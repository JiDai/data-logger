import App from './App.svelte';
import { mount } from 'svelte';
import './app.css';

const appElement = document.getElementById('app');
if (!appElement) {
	throw new Error('Cannot find app mount point');
}
const app = mount(App, { target: appElement });

export default app;
