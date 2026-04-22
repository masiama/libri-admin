import type { CrawlJob } from "./types";

export const CRAWL_JOB_STATUS_COLORS: Record<CrawlJob["status"], string> = {
  SUCCESS: "success",
  FAILED: "error",
  RUNNING: "warning",
};

export const CRAWL_JOB_STATUS_ICONS: Record<CrawlJob["status"], string> = {
  SUCCESS: "i-lucide-check",
  FAILED: "i-lucide-x",
  RUNNING: "i-lucide-loader-2",
};
