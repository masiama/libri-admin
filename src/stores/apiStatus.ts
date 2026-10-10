import { defineStore } from "pinia";

type ApiStatus = "online" | "offline" | "checking";
type ApiStatusState = {
  status: ApiStatus;
  crawlerStatus: ApiStatus;
  crawlerVersion: string | null;
};

export const useApiStatusStore = defineStore("apiStatus", {
  state: (): ApiStatusState => ({
    status: "checking",
    crawlerStatus: "checking",
    crawlerVersion: null,
  }),
  getters: {
    isOnline: (state) => state.status === "online",
    intervalMs: (state) => (state.status === "offline" ? 5_000 : 10_000),
  },
});
