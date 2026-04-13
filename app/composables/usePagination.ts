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
  const config = useRuntimeConfig();
  const baseUrl = `${config.public.apiBase}/api/v1${path}`;

  const { getToken } = useAuth();

  const page = ref(1);
  const limit = ref(10);

  const data = shallowRef<PaginatedResponse<T>>();
  const isLoading = ref(false);

  const fetchPaginatedData = async (url: string) => {
    isLoading.value = true;
    try {
      const token = await getToken.value();
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
