import { useAuth } from "@clerk/vue";
import * as Sentry from "@sentry/vue";
import type { SortingState } from "@tanstack/table-core";
import { createFetch, until } from "@vueuse/core";
import { computed, ref, type Ref } from "vue";
import * as z from "zod";

import { env } from "@/config";
import type {
  ListBooksParams,
  ListCrawlJobErrorsParams,
  ListCrawlJobsParams,
  ListPurgatoryBooksParams,
} from "@/generated/api/models";
import {
  PageMetadataSchema,
  type Book,
  type CrawlJob,
  type CrawlJobError,
  type PurgatoryBook,
} from "@/utils/types";

type Options = {
  sorting?: Ref<SortingState>;
  filter?: Ref<string>;
  size?: number;
};

type PageParams<T> = T extends PurgatoryBook
  ? ListPurgatoryBooksParams
  : T extends Book
    ? ListBooksParams
    : T extends CrawlJob
      ? ListCrawlJobsParams
      : T extends CrawlJobError
        ? ListCrawlJobErrorsParams
        : never;

const PaginatedResponseSchema = <T>(itemSchema: z.ZodType<T>) =>
  z.object({
    content: z.array(itemSchema),
    page: PageMetadataSchema,
  });

export type PaginatedResponse<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<T>>>;

export const usePagination = <T, P extends PageParams<T>>(
  getUrl: (params: P) => string,
  schema: z.ZodType<T>,
  options: Options = {},
) => {
  const page = ref(1);

  const url = computed(() => {
    const params = {
      page: page.value - 1,
      size: options.size ?? 20,
      sort: options.sorting?.value.map((sort) => `${sort.id},${sort.desc ? "desc" : "asc"}`),
      filter: options.filter?.value || undefined,
    } as P;

    return getUrl(params);
  });

  const { getToken, isLoaded, isSignedIn } = useAuth();

  const apiFetch = createFetch({
    options: {
      async beforeFetch({ options, cancel }) {
        await until(isLoaded).toBe(true);

        if (!isSignedIn.value) {
          cancel();
          return;
        }

        const token = await getToken.value({ template: env.clerkJwtTemplate });
        if (!token) {
          cancel();
          return;
        }

        options.headers = new Headers(options.headers);
        options.headers.set("Authorization", `Bearer ${token}`);

        return { options };
      },
      afterFetch(ctx) {
        if (ctx.response.status >= 400) {
          Sentry.captureMessage(`API Error: ${ctx.response.status} ${ctx.response.url}`, {
            level: "error",
            extra: { status: ctx.response.status, url: ctx.response.url },
          });
        }
        return ctx;
      },
      onFetchError(ctx) {
        if (ctx.error instanceof DOMException && ctx.error.name === "AbortError") return ctx;
        Sentry.captureException(
          ctx.error ?? new Error(`Fetch failed: HTTP ${ctx.response?.status ?? "unknown"}`),
          { extra: { status: ctx.response?.status, url: ctx.response?.url } },
        );
        return ctx;
      },
    },
  });

  const fetch = apiFetch(url, {
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
