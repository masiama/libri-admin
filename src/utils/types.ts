import * as z from "zod";

export type Source = {
  name: string;
  priority: number;
  enabled: boolean;
};

export const BookSchema = z.object({
  isbn: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  url: z.url(),
  sourceName: z.string(),
});
export type Book = z.infer<typeof BookSchema>;
