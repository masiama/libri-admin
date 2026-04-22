<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { type Row, type SortingState } from "@tanstack/table-core";
import { formatDate } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";

import AppLayout from "@/components/AppLayout.vue";
import CrawlJobStatus from "@/components/CrawlJobStatus.vue";
import { useCrawlJobEvents } from "@/composables/useCrawlJobEvents";
import { useAuthedFetch } from "@/composables/useFetch";
import { usePagination } from "@/composables/usePagination";
import { useApiStatusStore } from "@/stores/apiStatus";
import { useSourcesStore } from "@/stores/sources";
import { catchPromiseError, showErrorToast, showSuccessToast } from "@/utils";
import { CrawlJobSchema, type CrawlJob } from "@/utils/types";

const CRAWLER_START_ERROR_MESSAGE = "Failed to start crawler.";
const CRAWLERS_START_ERROR_MESSAGE = "Failed to start crawlers.";

const toast = useToast();
const fetch = useAuthedFetch();
const { isOnline } = storeToRefs(useApiStatusStore());
const { enabledSourceOptions } = storeToRefs(useSourcesStore());

const selectedSource = ref<string>();

const startAll = () =>
  fetch("/admin/crawl", { method: "POST" })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || CRAWLERS_START_ERROR_MESSAGE);
      }
      showSuccessToast(toast, "Crawlers started successfully!");
      return refetchHistory();
    })
    .catch(catchPromiseError(toast, CRAWLERS_START_ERROR_MESSAGE));

const startOne = () => {
  const source = selectedSource.value;
  if (!source) return;

  return fetch(`/admin/crawl/${encodeURIComponent(source)}`, { method: "POST" })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || CRAWLER_START_ERROR_MESSAGE);
      }
      showSuccessToast(toast, `Crawler started: ${source}`);
      return refetchHistory();
    })
    .catch(catchPromiseError(toast, CRAWLER_START_ERROR_MESSAGE));
};

const sorting = ref<SortingState>([{ id: "startedAt", desc: true }]);

const {
  page,
  data,
  isFetching,
  error: historyError,
  execute: refetchHistory,
} = usePagination("/admin/crawl", CrawlJobSchema, { sorting });

watch(historyError, (error) => {
  if (error && error.name !== "AbortError") {
    showErrorToast(toast, "An error occurred while fetching crawl history.");
    console.error(error);
  }
});

const { onJobStarted, onJobUpdated, onError } = useCrawlJobEvents();

onJobStarted(() => refetchHistory());
onJobUpdated((job: CrawlJob) => {
  const currentPage = data.value;
  if (!currentPage) return;

  const existingIndex = currentPage.content.findIndex((item) => item.id === job.id);
  if (existingIndex === -1) return;

  data.value = {
    ...currentPage,
    content: currentPage.content.map((item, index) => (index === existingIndex ? job : item)),
  };
});
onError(console.error);

const columns: TableColumn<CrawlJob>[] = [
  { id: "expand", meta: { class: { th: "w-16", td: "py-0" } } },
  { accessorKey: "startedAt", meta: { class: { th: "w-44" } } },
  { accessorKey: "finishedAt", meta: { class: { th: "w-44" } } },
  { accessorKey: "sourceName", meta: { class: { th: "w-40" } } },
  {
    accessorKey: "booksFound",
    header: "Books Found",
    meta: { class: { th: "w-32 text-center", td: "text-center" } },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { class: { th: "w-32 text-center", td: "text-center" } },
  },
  { accessorKey: "errorMessage", header: "Error", meta: { class: { td: "truncate" } } },
];

const expandRow = (_: Event, row: Row<CrawlJob>) =>
  row.original.errorMessage && row.toggleExpanded();
</script>

<template>
  <AppLayout>
    <template #header-controls>
      <USelect
        v-model="selectedSource"
        :items="enabledSourceOptions"
        placeholder="Select source"
        class="w-56"
        :disabled="!isOnline"
      />

      <UButton
        icon="i-lucide-play"
        label="Start source"
        class="rounded-full"
        :disabled="!isOnline || !selectedSource"
        @click="startOne"
      />

      <span class="text-sm font-medium">OR</span>

      <UButton
        icon="i-lucide-layers"
        label="Start all"
        class="rounded-full"
        :disabled="!isOnline"
        @click="startAll"
      />
    </template>

    <UTable
      sticky
      :data="data?.content"
      :columns="columns"
      :loading="isFetching"
      v-model:sorting="sorting"
      :sorting-options="{ manualSorting: true }"
      @select="expandRow"
      class="h-full overscroll-none"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0 w-full',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'bg-elevated/50 py-2',
        td: 'border-b border-default py-2',
        separator: 'h-0',
      }"
    >
      <template #startedAt-header="{ column }">
        <SortableColumnHeader :column="column" label="Started At" />
      </template>

      <template #finishedAt-header="{ column }">
        <SortableColumnHeader :column="column" label="Finished At" />
      </template>

      <template #sourceName-header="{ column }">
        <SortableColumnHeader :column="column" label="Source" />
      </template>

      <template #booksFound-header="{ column }">
        <SortableColumnHeader :column="column" label="Books Found" />
      </template>

      <template #expand-cell="{ row }">
        <UButton
          v-if="row.original.errorMessage"
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-down"
          square
          :ui="{
            leadingIcon: [
              'transition-transform',
              row.getIsExpanded() ? 'duration-200 rotate-180' : '',
            ],
          }"
          @click="row.toggleExpanded()"
        />
      </template>

      <template #startedAt-cell="{ row }">
        {{ formatDate(new Date(row.original.startedAt), "HH:mm:ss DD.MM.YYYY") }}
      </template>

      <template #finishedAt-cell="{ row }">
        <span v-if="row.original.finishedAt">
          {{ formatDate(new Date(row.original.finishedAt), "HH:mm:ss DD.MM.YYYY") }}
        </span>
        <UIcon v-else name="i-lucide-minus" class="mx-auto" />
      </template>

      <template #sourceName-cell="{ row }">
        <UBadge variant="subtle" color="neutral">{{ row.getValue("sourceName") }}</UBadge>
      </template>

      <template #status-cell="{ row }">
        <CrawlJobStatus :row="row" />
      </template>

      <template #expanded="{ row }">
        <pre class="whitespace-pre-wrap">{{ row.getValue("errorMessage") }}</pre>
      </template>
    </UTable>

    <template #footer-controls>
      <UPagination
        v-if="data && data.page.totalElements > data.page.size"
        v-model:page="page"
        :total="data.page.totalElements"
        :items-per-page="data.page.size"
        :disabled="!isOnline"
      />
    </template>
  </AppLayout>
</template>
