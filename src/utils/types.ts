import * as z from "zod";

export type Source = {
  name: string;
  priority: number;
  enabled: boolean;
};

export const BookSchema = z.object({
  isbn: z.string().nonempty("ISBN is required"),
  title: z.string().nonempty("Title is required"),
  authors: z.array(z.string().nonempty()),
  url: z.url(),
  sourceName: z.string().nonempty("Source is required"),
});
export type Book = z.infer<typeof BookSchema>;
