export const API_BASE_URL = "/api/v1";

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

export const formatDuration = (start: Date, end: Date): string => {
  const diffInMs = Math.abs(end.getTime() - start.getTime());
  if (diffInMs < 1000) return `${diffInMs}ms`;

  let totalSeconds = Math.floor(diffInMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(" ");
};
