import { getToken } from "@clerk/vue";
import * as Sentry from "@sentry/vue";

import { env } from "@/config";

export type BodyType<T> = T;

type FetchArgs = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: BodyType<unknown>;
  responseType?: string;
  headers?: HeadersInit;
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
    const message = await response.text().catch(() => "");
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if ([204, 205, 304].includes(response.status)) return undefined as T;
  return (responseType === "blob" ? await response.blob() : await response.json()) as T;
};

export default customFetch;
