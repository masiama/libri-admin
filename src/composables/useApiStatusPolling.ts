import { useDocumentVisibility, useEventListener, useIntervalFn } from "@vueuse/core";
import { watch } from "vue";

import { getPingUrl } from "@/generated/api/endpoints";
import { useApiStatusStore } from "@/stores/apiStatus";

export const useApiStatusPolling = () => {
  const store = useApiStatusStore();
  const visibility = useDocumentVisibility();

  const check = () =>
    fetch(getPingUrl())
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
