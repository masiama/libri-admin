import type { Book } from "./types";

export const createObjectUrl = (file: File) => URL.createObjectURL(file);

export const getBookImageUrl = (book: Book) =>
  `${import.meta.env.VITE_API_BASE}/api/v1/images/${book.isbn}.jpg`;

export const cloneBook = (book: Book): Book => ({ ...book, authors: [...book.authors] });

export const showErrorToast = (toast: ReturnType<typeof useToast>, description: string) =>
  toast.add({ title: "Error", description, color: "error", icon: "i-lucide-triangle-alert" });
export const showSuccessToast = (toast: ReturnType<typeof useToast>, description: string) =>
  toast.add({ title: "Success", description, color: "success", icon: "i-lucide-check" });
