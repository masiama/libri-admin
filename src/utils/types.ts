import * as z from "zod";

export const SourceSchema = z.object({
  name: z.string(),
  priority: z.number(),
  enabled: z.boolean(),
});
export type Source = z.infer<typeof SourceSchema>;
export const SourcesSchema = z.array(SourceSchema);

export const BookSchema = z.object({
  isbn: z.string().nonempty("ISBN is required"),
  title: z.string().nonempty("Title is required"),
  authors: z.array(z.string().nonempty()),
  url: z.url(),
  sourceName: z.string().nonempty("Source is required"),
});
export type Book = z.infer<typeof BookSchema>;

export const CrawlJobSchema = z.object({
  id: z.number(),
  sourceName: z.string(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  status: z.enum(["RUNNING", "SUCCESS", "FAILED"]),
  booksFound: z.number(),
  errorMessage: z.string().nullable(),
});
export type CrawlJob = z.infer<typeof CrawlJobSchema>;

export const PurgatoryBookSchema = z.object({
  id: z.number(),
  invalidIsbn: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  url: z.url(),
  sourceName: z.string(),
  resolvedIsbn: z.string().nullable(),
  createdAt: z.string(),
  deleted: z.boolean(),
});
export type PurgatoryBook = z.infer<typeof PurgatoryBookSchema>;
