import { useAuth } from "@clerk/vue";
import type { SortingState } from "@tanstack/table-core";
import { ref, shallowRef, watch, type Ref } from "vue";

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
  const baseUrl = `${import.meta.env.VITE_API_BASE}/api/v1${path}`;

  const { getToken } = useAuth();

  const page = ref(1);
  const limit = ref(10);

  const data = shallowRef<PaginatedResponse<T>>();
  const isLoading = ref(false);

  const fetchPaginatedData = async (url: string) => {
    isLoading.value = true;
    try {
      const token = await getToken.value({ template: import.meta.env.VITE_CLERK_JWT_TEMPLATE });
      if (!token) {
        throw new Error("Unauthorized");
      }

      const response: Response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        data.value = await Promise.resolve(response.json());
        isLoading.value = false;
      } else {
        isLoading.value = false;
        throw new Error("Unknown response");
      }
    } catch {
      isLoading.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  watch(
    [page, () => options.sorting?.value[0], () => options.filter?.value],
    ([newPage, newSorting, newFilter]) => {
      const url = new URL(`${baseUrl}`);

      url.searchParams.append("page", `${newPage - 1}`);
      if (newSorting) {
        url.searchParams.append("sort", `${newSorting.id},${newSorting.desc ? "desc" : "asc"}`);
      }
      if (newFilter) {
        url.searchParams.append("filter", newFilter);
      }

      return fetchPaginatedData(url.toString());
    },
    { immediate: true },
  );

  return { page, limit, isLoading, data };
};
