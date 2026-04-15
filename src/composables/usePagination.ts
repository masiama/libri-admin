import type { SortingState } from "@tanstack/table-core";
import { computed, ref, type Ref } from "vue";

import { useFetch } from "./useFetch";

type PaginatedResponse<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

type Options = {
  sorting?: Ref<SortingState>;
  filter?: Ref<string>;
};

export const usePagination = <T>(path: string, options: Options = {}) => {
  const page = ref(1);

  const url = computed(() => {
    const params = new URLSearchParams();

    params.append("page", `${page.value - 1}`);
    if (options.sorting?.value[0]) {
      const sorting = options.sorting.value[0];
      params.append("sort", `${sorting.id},${sorting.desc ? "desc" : "asc"}`);
    }
    if (options.filter?.value) {
      params.append("filter", options.filter.value);
    }

    return `${path}?${params.toString()}`;
  });

  const fetch = useFetch()(url, { refetch: true }).get().json<PaginatedResponse<T>>();

  return { ...fetch, page };
};
