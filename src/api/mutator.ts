import { getToken } from "@clerk/vue";
import * as Sentry from "@sentry/vue";
import * as z from "zod";

import { env } from "@/config";

export type BodyType<T> = T;

type FetchArgs = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: BodyType<unknown>;
  responseType?: string;
  headers?: HeadersInit;
};

// Spring returns RFC 9457 problem details; never show the raw body
const ProblemDetailSchema = z.object({
  title: z.string().optional(),
  detail: z.string().optional(),
});

const readErrorMessage = async (response: Response) => {
  const problem = ProblemDetailSchema.safeParse(await response.json().catch(() => null));
  return (
    (problem.success && (problem.data.detail || problem.data.title)) ||
    `Request failed (${response.status})`
  );
};

export const customFetch = async <T>(
  url: string,
  { method, body, responseType, headers: extraHeaders }: FetchArgs,
): Promise<T> => {
  const token = await getToken({ template: env.clerkJwtTemplate });
  if (!token) throw new Error("User is not signed in");

  const isFormData = body instanceof FormData;
  const headers = new Headers(extraHeaders);
  headers.set("Authorization", `Bearer ${token}`);
  if (body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    Sentry.captureException(error, { extra: { url } });
    throw error;
  }

  if (response.status >= 400) {
    Sentry.captureMessage(`API Error: ${response.status} ${url}`, {
      level: "error",
      extra: { status: response.status, url },
    });
    throw new Error(await readErrorMessage(response));
  }

  if ([204, 205, 304].includes(response.status)) return undefined as T;
  if (responseType === "blob") return (await response.blob()) as T;
  const contentType = response.headers.get("Content-Type") ?? "";
  return (
    contentType.includes("application/json") ? await response.json() : await response.text()
  ) as T;
};

export default customFetch;
