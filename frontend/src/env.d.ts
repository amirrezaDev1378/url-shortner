/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PUBLIC_URLS_DOMAIN: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
