<script setup lang="ts">
import type { Row } from "@tanstack/table-core";
import { computed } from "vue";

import { CRAWL_JOB_STATUS_COLORS, CRAWL_JOB_STATUS_ICONS } from "@/utils/crawlJob";
import type { CrawlJob } from "@/utils/types";

const props = defineProps<{ row: Row<CrawlJob> }>();
const status = computed(() => props.row.original.status);

const ui = computed(() => ({
  color: CRAWL_JOB_STATUS_COLORS[status.value],
  icon: CRAWL_JOB_STATUS_ICONS[status.value],
  isAnimated: status.value === "RUNNING",
}));
</script>

<template>
  <UBadge variant="subtle" :color="ui.color" square>
    <UIcon :name="ui.icon" :class="{ 'animate-spin': ui.isAnimated }" />
  </UBadge>
</template>
