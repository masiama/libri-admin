import { useAuth } from "@clerk/vue";
import { createFetch, until, useFetch as useVUFetch } from "@vueuse/core";

let _apiFetch: typeof useVUFetch | null = null;

export const useFetch = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  if (!_apiFetch)
    _apiFetch = createFetch({
      baseUrl: `${import.meta.env.VITE_API_BASE}/api/v1`,
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
