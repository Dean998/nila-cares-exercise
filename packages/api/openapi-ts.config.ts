import {defineConfig} from '@hey-api/openapi-ts';

export default defineConfig({
	input: 'openapi.json',
	output: '../client/src',
	plugins: ['@hey-api/client-fetch', '@tanstack/react-query'],
});
