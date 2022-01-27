/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string;
  readonly VITE_AMPLIFY_REGION: string;
  readonly VITE_AMPLIFY_USER_POOL_ID: string;
  readonly VITE_AMPLIFY_CLIENT_ID: string;
  readonly VITE_AMPLIFY_DOMAIN: string;
  readonly VITE_AMPLIFY_REDIRECT_SIGN_IN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
