/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_CLERK_JWT_TEMPLATE: string;
  readonly VITE_API_BASE: string;
  readonly VITE_SENTRY_DSN: string;
}
