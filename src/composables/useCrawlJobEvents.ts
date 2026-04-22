import { createEventHook } from "@vueuse/core";
import { onMounted, onUnmounted } from "vue";

import { CrawlJobSchema, type CrawlJob } from "@/utils/types";

import { useAuthedFetch } from "./useFetch";

const RETRY_DELAY_MS = 3_000;

export const useCrawlJobEvents = () => {
  const fetch = useAuthedFetch();

  const startedHook = createEventHook<CrawlJob>();
  const updatedHook = createEventHook<CrawlJob>();
  const errorHook = createEventHook<unknown>();

  let active = true;
  let abortController: AbortController | null = null;

  const handleEvent = async (eventName: string, data: string) => {
    if (eventName === "connected") return;

    const job = CrawlJobSchema.parse(JSON.parse(data));

    switch (eventName) {
      case "crawl-job-started":
        return startedHook.trigger(job);
      case "crawl-job-updated":
        return updatedHook.trigger(job);
      default:
        console.warn(`Unknown event: ${eventName}`);
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
          let eventName = "message";
          const dataLines: string[] = [];

          for (const line of rawEvent.split(/\r?\n/)) {
            if (line.startsWith("event:")) eventName = line.slice(6).trim();
            else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
          }

          if (dataLines.length > 0) {
            void handleEvent(eventName, dataLines.join("\n"));
          }
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
        await fetch("/admin/crawl/events", { signal: abortController.signal }).then(consumeStream);
      } catch (error) {
        if (!active || abortController.signal.aborted) return;
        void errorHook.trigger(error);
      }

      if (!active) break;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  };

  onMounted(connect);

  onUnmounted(() => {
    active = false;
    abortController?.abort();
  });

  return {
    onJobStarted: startedHook.on,
    onJobUpdated: updatedHook.on,
    onError: errorHook.on,
  };
};
