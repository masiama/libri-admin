import { API_BASE_URL } from ".";
import type { Book } from "./types";

export const getBookImageUrl = (book: Book) => `${API_BASE_URL}/images/${book.isbn}.jpg`;

export const cloneBook = (book: Book): Book => ({ ...book, authors: [...book.authors] });

export const createEmptyBook = (): Book => ({
  isbn: "",
  title: "",
  authors: [],
  url: "",
  sourceName: "",
  barcodes: [],
});
