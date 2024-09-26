import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
	server: {
		host: "0.0.0.0",
		https: true,
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
