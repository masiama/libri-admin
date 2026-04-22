import { defineStore } from "pinia";

import type { Source } from "@/utils/types";

type SourcesState = {
  sources: Source[];
};

export const useSourcesStore = defineStore("sources", {
  state: (): SourcesState => ({ sources: [] }),
  getters: {
    sourceOptions: (state) => state.sources.map((s) => s.name),
    enabledSourceOptions: (state) => state.sources.filter((s) => s.enabled).map((s) => s.name),
    loaded: (state) => state.sources.length > 0,
  },
});
