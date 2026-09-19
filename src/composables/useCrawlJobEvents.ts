import { useAuth } from "@clerk/vue";
import * as Sentry from "@sentry/vue";
import { createEventHook, until, useEventListener } from "@vueuse/core";
import { onMounted, onUnmounted } from "vue";

import { env } from "@/config";
import {
  CrawlJobSchema,
  ProgressEventSchema,
  type CrawlJob,
  type ProgressEvent,
} from "@/utils/types";

const RETRY_DELAY_MS = 3_000;
const CRAWL_EVENTS_URL = "/api/v1/admin/crawl/events";

export const useCrawlJobEvents = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const fetchEvents = async (signal: AbortSignal) => {
    await until(isLoaded).toBe(true);
    if (!isSignedIn.value) throw new Error("User is not signed in");

    const token = await getToken.value({ template: env.clerkJwtTemplate });
    if (!token) throw new Error("Failed to get auth token");

    try {
      return await fetch(CRAWL_EVENTS_URL, {
        signal,
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      if (!(error instanceof Error) || error.name !== "AbortError") {
        Sentry.captureException(error, { extra: { url: CRAWL_EVENTS_URL } });
      }
      throw error;
    }
  };

  const startedHook = createEventHook();
  const updatedHook = createEventHook<CrawlJob>();
  const progressHook = createEventHook<ProgressEvent>();
  const errorHook = createEventHook<unknown>();

  let active = true;
  let abortController: AbortController | null = null;

  const handleEvent = async (eventName: string, data: string) => {
    Sentry.metrics.count("sse_event_received", 1, { attributes: { event: eventName } });
    Sentry.logger.debug(`Received event: ${eventName}`, { tags: { eventName }, extra: { data } });
    if (eventName === "connected") return;

    switch (eventName) {
      case "crawl-job-started":
        return startedHook.trigger();
      case "crawl-job-updated":
        return updatedHook.trigger(CrawlJobSchema.parse(JSON.parse(data)));
      case "crawl-job-progress":
        return progressHook.trigger(ProgressEventSchema.parse(JSON.parse(data)));
      default:
        Sentry.captureMessage(`Unknown event: ${eventName}`, {
          level: "warning",
          tags: { eventName },
          extra: { data },
        });
    }
  };

  const consumeStream = async (response: Response) => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to subscribe to crawl job events.");
    }

    if (!response.body) {
      throw new Error("Crawl job event stream is unavailable.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (active) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const rawEvent of parts) {
          let eventName;
          const dataLines: string[] = [];

          for (const line of rawEvent.split(/\r?\n/)) {
            if (line.startsWith("event:")) eventName = line.slice(6).trim();
            else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
          }
          if (!eventName) continue;

          void handleEvent(eventName, dataLines.join("\n"));
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  const connect = async () => {
    while (active) {
      abortController = new AbortController();

      try {
        await fetchEvents(abortController.signal).then(consumeStream);
      } catch (error) {
        if (!active || abortController.signal.aborted) return;
        // Suppress browser-native stream errors caused by page unload/refresh
        // tearing down the fetch connection before onUnmounted can abort it.
        if (error instanceof TypeError && error.message.includes("Error in input stream")) return;
        void errorHook.trigger(error);
      }

      if (!active) break;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  };

  onMounted(connect);

  useEventListener(window, "beforeunload", () => {
    active = false;
  });
  useEventListener(window, "pageshow", () => {
    active = true;
  });

  onUnmounted(() => {
    active = false;
    abortController?.abort();
  });

  return {
    onJobStarted: startedHook.on,
    onJobUpdated: updatedHook.on,
    onJobProgress: progressHook.on,
    onError: errorHook.on,
  };
};
