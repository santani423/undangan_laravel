/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RSVP_ENDPOINT?: string;
  readonly VITE_GUESTBOOK_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
