import { useDocumentVisibility, useEventListener, useIntervalFn } from "@vueuse/core";
import { watch } from "vue";

import { useApiStatusStore } from "@/stores/apiStatus";
import { API_BASE_URL } from "@/utils";

export const useApiStatusPolling = () => {
  const store = useApiStatusStore();
  const visibility = useDocumentVisibility();

  const check = () =>
    fetch(`${API_BASE_URL}/ping`)
      .then((response) => (store.status = response.ok ? "online" : "offline"))
      .catch(() => (store.status = "offline"));

  const { pause, resume } = useIntervalFn(check, () => store.intervalMs, {
    immediate: true,
    immediateCallback: true,
  });
  useEventListener("online", check);
  useEventListener("offline", () => (store.status = "offline"));

  watch(visibility, (visible) => (visible ? resume() : pause()), { immediate: true });
};
