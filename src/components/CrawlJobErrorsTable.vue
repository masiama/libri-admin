<script setup lang="ts">
import { formatDate } from "@vueuse/core";

import { usePagination } from "@/composables/usePagination";
import { CrawlJobErrorSchema, type CrawlJob } from "@/utils/types";

const props = defineProps<{ jobId: CrawlJob["id"] }>();

const { page, data, isFetching } = usePagination(
  `/admin/crawl/${props.jobId}/errors`,
  CrawlJobErrorSchema,
);

const columns = [
  {
    accessorKey: "occurredAt",
    header: "Time",
    meta: { class: { th: "w-44" } },
  },
  {
    accessorKey: "url",
    header: "URL",
    meta: { class: { th: "w-60", td: "truncate max-w-60 py-1" } },
  },
  {
    accessorKey: "message",
    header: "Message",
    meta: { class: { td: "truncate" } },
  },
];

const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

defineExpose({ page, data });
</script>

<template>
  <UTable
    :data="data?.content ?? []"
    :columns="columns"
    :loading="isFetching"
    :ui="{ base: 'table-fixed w-full', td: 'py-2', th: 'py-2' }"
  >
    <template #occurredAt-cell="{ row }">
      {{ formatDate(row.original.occurredAt, "HH:mm:ss DD.MM.YYYY") }}
    </template>

    <template #url-cell="{ row }">
      <template v-if="row.original.url">
        <div class="flex items-center gap-1">
          <a
            :href="row.original.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary truncate hover:underline"
            :title="row.original.url"
          >
            {{ row.original.url }}
          </a>
          <UButton
            icon="i-lucide-copy"
            size="xs"
            color="neutral"
            variant="ghost"
            square
            class="shrink-0"
            @click="copyToClipboard(row.original.url)"
          />
        </div>
      </template>
      <UIcon v-else name="i-lucide-minus" class="text-muted" />
    </template>

    <template #message-cell="{ row }">
      <span :title="row.original.message">
        {{ row.original.message }}
      </span>
    </template>

    <template #empty>
      <div class="text-muted py-8 text-center text-sm">No errors found</div>
    </template>
  </UTable>
</template>
