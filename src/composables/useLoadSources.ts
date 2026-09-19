import { useAuth } from "@clerk/vue";
import { until } from "@vueuse/core";
import { onMounted } from "vue";

import { listSources } from "@/generated/api/endpoints";
import { useSourcesStore } from "@/stores/sources";
import { showErrorToast } from "@/utils";
import { SourcesSchema } from "@/utils/types";

const ERROR_MESSAGE = "An error occurred while fetching sources.";

export const useLoadSources = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const store = useSourcesStore();
  const toast = useToast();

  onMounted(async () => {
    if (store.loaded) return;

    await until(isLoaded).toBe(true);
    if (!isSignedIn.value) return;

    try {
      store.sources = SourcesSchema.parse(await listSources());
    } catch (e) {
      showErrorToast(toast, e instanceof Error ? e.message : ERROR_MESSAGE);
    }
  });
};
