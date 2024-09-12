import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";
import basicSsl from "@vitejs/plugin-basic-ssl";
// https://astro.build/config
export default defineConfig({
	vite: {
		// plugins: [basicSsl()], // bun does not support this yet
	},
	server: {
		https: false, // bun does not support this yet
		host: "0.0.0.0",
	},
	prefetch: true,
	compressHTML: true,
	integrations: [
		tailwind({
			applyBaseStyles: true,
		}),
		react(),
	],
	output: "hybrid",
	adapter: node({
		mode: "middleware",
	}),
});
