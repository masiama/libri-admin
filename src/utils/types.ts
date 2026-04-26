import * as z from "zod";

export const SourceSchema = z.object({ name: z.string(), enabled: z.boolean() }).strict();
export type Source = z.infer<typeof SourceSchema>;
export const SourcesSchema = z.array(SourceSchema);

export const BookSchema = z
  .object({
    isbn: z.string().nonempty("ISBN is required"),
    title: z.string().nonempty("Title is required"),
    authors: z.array(z.string().nonempty()),
    url: z.url(),
    sourceName: z.string().nonempty("Source is required"),
  })
  .strict();
export type Book = z.infer<typeof BookSchema>;

export const CrawlJobSchema = z
  .object({
    id: z.number(),
    sourceName: z.string(),
    startedAt: z.iso.datetime({ local: true }).pipe(z.coerce.date()),
    finishedAt: z.iso.datetime({ local: true }).pipe(z.coerce.date()).nullable(),
    status: z.enum(["RUNNING", "SUCCESS", "FAILED"]),
    booksFound: z.number(),
    errorMessage: z.string().nullable(),
  })
  .strict();
export type CrawlJob = z.infer<typeof CrawlJobSchema>;

export const PurgatoryBookSchema = z
  .object({
    id: z.number(),
    invalidIsbn: z.string(),
    title: z.string(),
    authors: z.array(z.string()),
    url: z.url(),
    sourceName: z.string(),
    createdAt: z.iso.datetime({ local: true }).pipe(z.coerce.date()),
  })
  .strict();
export type PurgatoryBook = z.infer<typeof PurgatoryBookSchema>;
