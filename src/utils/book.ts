import type { Book } from "./types";

export const getBookImageUrl = (book: Book) =>
  `${import.meta.env.VITE_API_BASE}/api/v1/images/${book.isbn}.jpg`;

export const cloneBook = (book: Book): Book => ({ ...book, authors: [...book.authors] });

export const createEmptyBook = (): Book => ({
  isbn: "",
  title: "",
  authors: [],
  url: "",
  sourceName: "",
});
