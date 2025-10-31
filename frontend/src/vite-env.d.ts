/// <reference types="vite/client" />

interface ImportMetaEnv {
  // add environment variables here, expose with VITE_ prefix in .env files
  VITE_ENVIRONMENT: string;
  VITE_MIXPANEL_TOKEN: string;
  VITE_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
