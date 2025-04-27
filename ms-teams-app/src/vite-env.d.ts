/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MSAL_CLIENT_ID: string;
  readonly VITE_MSAL_AUTHORITY: string;
  readonly VITE_MSAL_REDIRECT_URI: string;
  readonly VITE_GRAPH_ME_ENDPOINT: string;
  readonly VITE_GRAPH_CHATS_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
