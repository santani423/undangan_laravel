/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Base URL of the Laravel REST API, e.g. https://be.undesia.com/api/v1 (or /api/v1 behind the dev proxy). */
    readonly VITE_API_BASE_URL?: string;
    /** Origin of the Laravel backend; derived from VITE_API_BASE_URL when empty. */
    readonly VITE_BACKEND_URL?: string;
    readonly VITE_APP_NAME?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
