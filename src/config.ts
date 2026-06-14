interface RuntimeConfig {
  VITE_CLERK_PUBLISHABLE_KEY?: string;
  VITE_CLERK_JWT_TEMPLATE?: string;
  VITE_SENTRY_DSN?: string;
}

declare global {
  interface Window {
    RUNTIME_CONFIG?: RuntimeConfig;
  }
}

const runtime = window.RUNTIME_CONFIG ?? {};

export const env = {
  clerkPublishableKey:
    runtime.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  clerkJwtTemplate: runtime.VITE_CLERK_JWT_TEMPLATE || import.meta.env.VITE_CLERK_JWT_TEMPLATE,
  sentryDsn: runtime.VITE_SENTRY_DSN || import.meta.env.VITE_SENTRY_DSN,
};
