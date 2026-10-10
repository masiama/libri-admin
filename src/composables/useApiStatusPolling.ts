import { useDocumentVisibility, useEventListener, useIntervalFn } from "@vueuse/core";
import { watch } from "vue";

import { getPingUrl } from "@/generated/api/endpoints";
import { PingResponse } from "@/generated/api/zod";
import { useApiStatusStore } from "@/stores/apiStatus";

export const useApiStatusPolling = () => {
  const store = useApiStatusStore();
  const visibility = useDocumentVisibility();

  const setOffline = () => {
    store.status = "offline";
    // Without the API there's no way to know the crawler status.
    store.crawlerStatus = "checking";
    store.crawlerVersion = null;
  };

  const check = () =>
    fetch(getPingUrl())
      .then(async (response) => {
        if (!response.ok) return setOffline();
        store.status = "online";
        const ping = PingResponse.safeParse(await response.json());
        store.crawlerStatus = ping.success ? ping.data.crawler.status : "offline";
        store.crawlerVersion = ping.success ? ping.data.crawler.version : null;
      })
      .catch(setOffline);

  const { pause, resume } = useIntervalFn(check, () => store.intervalMs, {
    immediate: true,
    immediateCallback: true,
  });
  useEventListener("online", check);
  useEventListener("offline", setOffline);

  watch(visibility, (visible) => (visible ? resume() : pause()), { immediate: true });
};
