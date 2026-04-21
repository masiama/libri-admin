import { useAuth } from "@clerk/vue";
import { until } from "@vueuse/core";
import { onMounted } from "vue";

import { useAuthedFetch } from "@/composables/useFetch";
import { useSourcesStore } from "@/stores/sources";
import { showErrorToast } from "@/utils";
import { SourcesSchema } from "@/utils/types";

const ERROR_MESSAGE = "An error occurred while fetching sources.";

export const useLoadSources = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const store = useSourcesStore();
  const fetch = useAuthedFetch();
  const toast = useToast();

  onMounted(async () => {
    if (store.loaded) return;

    await until(isLoaded).toBe(true);
    if (!isSignedIn.value) return;

    try {
      const response = await fetch("/sources");
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || ERROR_MESSAGE);
      }

      store.sources = SourcesSchema.parse(await response.json());
    } catch (e) {
      showErrorToast(toast, e instanceof Error ? e.message : ERROR_MESSAGE);
    }
  });
};
