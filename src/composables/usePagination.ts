import { useAuth } from "@clerk/vue";
import { ref, shallowRef, watch } from "vue";

type PaginatedResponse<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

export const usePagination = <T>(path: string) => {
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

  watch(page, (newValue) => fetchPaginatedData(`${baseUrl}?page=${newValue}`), { immediate: true });

  return { page, limit, isLoading, data };
};
