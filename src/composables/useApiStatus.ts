import { useEventListener, useIntervalFn } from "@vueuse/core";
import { computed, ref, watch } from "vue";

import { store } from "@/store";
import { API_BASE_URL } from "@/utils";

type ApiStatus = "online" | "offline" | "checking";

export const useApiStatus = (refetchBooks: () => Promise<void>) => {
  const status = ref<ApiStatus>("checking");
  const wasOffline = ref(false);
  const interval = computed(() => (status.value === "offline" ? 5_000 : 10_000));

  const check = async () => {
    try {
      await fetch(`${API_BASE_URL}/ping`);
      if (wasOffline.value) {
        void refetchBooks();
        wasOffline.value = false;
      }
      status.value = "online";
    } catch {
      wasOffline.value = true;
      status.value = "offline";
    }
  };

  useIntervalFn(check, interval, { immediate: true });
  useEventListener("online", check);
  useEventListener("offline", () => (status.value = "offline"));

  watch(status, (newStatus) => (store.isOnline = newStatus === "online"));

  return status;
};
