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
