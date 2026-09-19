import { getGetImageUrl } from "@/generated/api/endpoints";

import type { Book } from "./types";

export const getBookImageUrl = (book: Book) => getGetImageUrl(book.isbn);

export const cloneBook = (book: Book): Book => ({ ...book, authors: [...book.authors] });

export const createEmptyBook = (): Book => ({
  isbn: "",
  title: "",
  authors: [],
  url: "",
  sourceName: "",
  barcodes: [],
});
