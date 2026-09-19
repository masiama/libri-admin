import * as z from "zod";

import { GetBookByIsbnResponse } from "@/generated/api/zod/book-controller/book-controller";
import {
  ListCrawlJobErrorsResponse,
  ListCrawlJobsResponse,
} from "@/generated/api/zod/crawler-controller/crawler-controller";
import { ApprovePurgatoryBookResponse } from "@/generated/api/zod/purgatory-controller/purgatory-controller";
import { ListSourcesResponseItem } from "@/generated/api/zod/source-controller/source-controller";

export const PageMetadataSchema = ListCrawlJobsResponse.shape.page.unwrap().required();

const SourceSchema = ListSourcesResponseItem.required().strict();
export type Source = z.infer<typeof SourceSchema>;
export const SourcesSchema = z.array(SourceSchema);

const BookBarcodeItemSchema = GetBookByIsbnResponse.shape.barcodes.unwrap().element;

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

const CrawlJobItemSchema = ListCrawlJobsResponse.shape.content.unwrap().element;

export const CrawlJobSchema = CrawlJobItemSchema.required()
  .extend({ startedAt: z.coerce.date(), finishedAt: z.coerce.date().nullable() })
  .strict();
export type CrawlJob = z.infer<typeof CrawlJobSchema>;

export const PurgatoryBookSchema = ApprovePurgatoryBookResponse.required()
  .extend({ createdAt: z.coerce.date() })
  .strict();
export type PurgatoryBook = z.infer<typeof PurgatoryBookSchema>;

export const ProgressEventSchema = CrawlJobSchema.pick({ id: true, booksFound: true }).strict();
export type ProgressEvent = z.infer<typeof ProgressEventSchema>;

const CrawlJobErrorItemSchema = ListCrawlJobErrorsResponse.shape.content.unwrap().element;

export const CrawlJobErrorSchema = CrawlJobErrorItemSchema.required()
  .extend({ occurredAt: z.coerce.date() })
  .strict();
export type CrawlJobError = z.infer<typeof CrawlJobErrorSchema>;
