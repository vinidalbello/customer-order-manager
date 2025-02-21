import tailwindcss from '@tailwindcss/vite';
import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		host: true,
	},
	preview: {
		allowedHosts: ['customer-order-manager-production.up.railway.app'],
	},
});
