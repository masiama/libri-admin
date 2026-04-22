export const API_BASE_URL = `${import.meta.env.VITE_API_BASE}/api/v1`;

export const createObjectUrl = (file: File) => URL.createObjectURL(file);

export const showErrorToast = (toast: ReturnType<typeof useToast>, description: string) =>
  toast.add({ title: "Error", description, color: "error", icon: "i-lucide-triangle-alert" });
export const showSuccessToast = (toast: ReturnType<typeof useToast>, description: string) =>
  toast.add({ title: "Success", description, color: "success", icon: "i-lucide-check" });

export const catchPromiseError =
  (toast: ReturnType<typeof useToast>, defaultMessage: string) => (error: unknown) => {
    console.error(error);
    showErrorToast(toast, error instanceof Error ? error.message : defaultMessage);
  };
