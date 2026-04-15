import { useAuth } from "@clerk/vue";
import { createFetch, until, useFetch as useVUFetch } from "@vueuse/core";

let _apiFetch: typeof useVUFetch | null = null;

const API_BASE_URL = `${import.meta.env.VITE_API_BASE}/api/v1`;

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

    return fetch(API_BASE_URL + path, { ...init, headers });
  };
};
