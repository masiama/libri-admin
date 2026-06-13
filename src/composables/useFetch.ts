import { useAuth } from "@clerk/vue";
import * as Sentry from "@sentry/vue";
import { createFetch, until, useFetch as useVUFetch } from "@vueuse/core";

import { API_BASE_URL } from "@/utils";

let _apiFetch: typeof useVUFetch | null = null;

export const useFetch = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  if (!_apiFetch)
    _apiFetch = createFetch({
      baseUrl: API_BASE_URL,
      options: {
        async beforeFetch({ options, cancel }) {
          await until(isLoaded).toBe(true);

          if (!isSignedIn.value) {
            cancel();
            return;
          }

          const token = await getToken.value({ template: import.meta.env.VITE_CLERK_JWT_TEMPLATE });
          if (!token) {
            cancel();
            return;
          }

          options.headers = new Headers(options.headers);
          options.headers.set("Authorization", `Bearer ${token}`);

          return { options };
        },
        afterFetch(ctx) {
          if (ctx.response.status >= 400) {
            Sentry.captureMessage(`API Error: ${ctx.response.status} ${ctx.response.url}`, {
              level: "error",
              extra: { status: ctx.response.status, url: ctx.response.url },
            });
          }
          return ctx;
        },
        onFetchError(ctx) {
          if (ctx.error instanceof DOMException && ctx.error.name === "AbortError") return ctx;
          Sentry.captureException(
            ctx.error ?? new Error(`Fetch failed: HTTP ${ctx.response?.status ?? "unknown"}`),
            { extra: { status: ctx.response?.status, url: ctx.response?.url } },
          );
          return ctx;
        },
      },
    });

  return _apiFetch;
};

export const useAuthedFetch = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return async (path: string, init?: RequestInit) => {
    await until(isLoaded).toBe(true);
    if (!isSignedIn.value) throw new Error("User is not signed in");

    const token = await getToken.value({ template: import.meta.env.VITE_CLERK_JWT_TEMPLATE });
    if (!token) throw new Error("Failed to get auth token");

    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const fullUrl = API_BASE_URL + path;

    try {
      return await fetch(fullUrl, { ...init, headers });
    } catch (error) {
      if (!(error instanceof Error) || error.name !== "AbortError") {
        Sentry.captureException(error, { extra: { url: fullUrl } });
      }
      throw error;
    }
  };
};
