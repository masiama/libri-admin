import type { SortingState } from "@tanstack/table-core";
import { computed, ref, type Ref } from "vue";
import * as z from "zod";

import { useFetch } from "./useFetch";

type Options = {
  sorting?: Ref<SortingState>;
  filter?: Ref<string>;
  size?: number;
};

const PaginatedResponseSchema = <T>(itemSchema: z.ZodSchema<T>) =>
  z.object({
    content: z.array(itemSchema),
    page: z.object({
      size: z.number(),
      number: z.number(),
      totalElements: z.number(),
      totalPages: z.number(),
    }),
  });

export type PaginatedResponse<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<T>>>;

export const usePagination = <T>(path: string, schema: z.ZodSchema<T>, options: Options = {}) => {
  const page = ref(1);

  const url = computed(() => {
    const params = new URLSearchParams();

    params.append("page", `${page.value - 1}`);
    params.append("size", `${options.size ?? 20}`);
    if (options.sorting) {
      for (const sort of options.sorting.value) {
        params.append("sort", `${sort.id},${sort.desc ? "desc" : "asc"}`);
      }
    }
    if (options.filter?.value) {
      params.append("filter", options.filter.value);
    }

    return `${path}?${params.toString()}`;
  });

  const fetch = useFetch()(url, {
    refetch: true,
    afterFetch(ctx) {
      ctx.data = PaginatedResponseSchema(schema).parse(ctx.data);
      return ctx;
    },
  })
    .get()
    .json<PaginatedResponse<T>>();

  return { ...fetch, page };
};
