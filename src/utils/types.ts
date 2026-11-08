import * as z from "zod";

import {
  ApprovePurgatoryBookResponse,
  GetBookByIsbnResponse,
  ListCrawlJobErrorsResponse,
  ListCrawlJobsResponse,
} from "@/generated/api/zod";

export const PageMetadataSchema = ListCrawlJobsResponse.shape.page;

const BookBarcodeItemSchema = GetBookByIsbnResponse.shape.barcodes.unwrap();

export const BarcodeSchema = BookBarcodeItemSchema.extend({
  value: z.string().nonempty("Barcode value is required"),
  type: z.string().nonempty("Barcode type is required"),
}).strict();

export const BookSchema = GetBookByIsbnResponse.extend({
  isbn: z.string().nonempty("ISBN is required"),
  title: z.string().nonempty("Title is required"),
  authors: z.array(z.string().nonempty()),
  url: z.url(),
  sourceName: z.string().nonempty("Source is required"),
  barcodes: z.array(BarcodeSchema).nonempty("At least one barcode is required"),
}).strict();
export type Book = z.infer<typeof BookSchema>;

export const CrawlJobSchema = ListCrawlJobsResponse.shape.content.element
  .extend({
    startedAt: z.coerce.date(),
    finishedAt: z.coerce.date().nullable(),
    estimatedDurationMs: z.number().nullish(),
  })
  .strict();
export type CrawlJob = z.infer<typeof CrawlJobSchema>;

export const PurgatoryBookSchema = ApprovePurgatoryBookResponse.extend({
  createdAt: z.coerce.date(),
}).strict();
export type PurgatoryBook = z.infer<typeof PurgatoryBookSchema>;

export const ProgressEventSchema = CrawlJobSchema.pick({
  id: true,
  booksFound: true,
  estimatedDurationMs: true,
}).strict();
export type ProgressEvent = z.infer<typeof ProgressEventSchema>;

export const CrawlJobErrorSchema = ListCrawlJobErrorsResponse.shape.content.element
  .extend({ occurredAt: z.coerce.date() })
  .strict();
export type CrawlJobError = z.infer<typeof CrawlJobErrorSchema>;
