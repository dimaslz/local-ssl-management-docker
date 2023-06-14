import path from "path";
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'index',
			fileName: 'index',
			formats: ["cjs", "es", "umd"],
		},
		ssr: true,
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "./"),
			"@": path.resolve(__dirname, "src"),
		},
	},
});
