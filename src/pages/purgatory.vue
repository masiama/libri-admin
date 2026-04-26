<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { SortingState } from "@tanstack/table-core";
import { formatDate, refDebounced } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { ref, useTemplateRef, watch } from "vue";

import AppLayout from "@/components/AppLayout.vue";
import ApprovePurgatoryBookButton from "@/components/ApprovePurgatoryBookButton.vue";
import DeletePurgatoryBookButton from "@/components/DeletePurgatoryBookButton.vue";
import { usePagination } from "@/composables/usePagination";
import { useApiStatusStore } from "@/stores/apiStatus";
import { showErrorToast } from "@/utils";
import { PurgatoryBookSchema, type PurgatoryBook } from "@/utils/types";

const toast = useToast();
const { isOnline } = storeToRefs(useApiStatusStore());

const search = ref("");
const debouncedFilter = refDebounced(search, 300);
const filterRef = useTemplateRef("filter");

const sorting = ref<SortingState>([]);

const isbns = ref<Record<string, string>>({});

const {
  page,
  data,
  isFetching,
  error: booksError,
  execute: refetchPurgatoryBooks,
} = usePagination("/admin/purgatory", PurgatoryBookSchema, { filter: debouncedFilter, sorting });

watch(booksError, (error) => {
  if (error && error.name !== "AbortError") {
    showErrorToast(toast, "An error occurred while fetching purgatory books.");
    console.error(error);
  }
});

defineShortcuts({ "/": () => filterRef.value?.inputRef?.focus() });

const columns: TableColumn<PurgatoryBook>[] = [
  { accessorKey: "invalidIsbn", header: "ISBN", meta: { class: { th: "w-40" } } },
  { accessorKey: "sourceName", meta: { class: { th: "w-36" } } },
  { accessorKey: "createdAt", meta: { class: { th: "w-44" } } },
  { accessorKey: "title", meta: { class: { td: "truncate" } } },
  { id: "actions", meta: { class: { th: "w-46" } } },
];

watch(data, (newData) => {
  newData?.content.forEach((book) => {
    if (!(book.id in isbns.value)) {
      isbns.value[book.id] = book.invalidIsbn;
    }
  });
});
</script>

<template>
  <AppLayout>
    <template #header-controls>
      <UInput
        ref="filter"
        v-model="search"
        class="max-w-sm"
        icon="i-lucide-search"
        placeholder="Filter purgatory books..."
        :disabled="!isOnline"
      >
        <template #trailing>
          <UKbd value="/" />
        </template>
      </UInput>
    </template>

    <UTable
      sticky
      :data="data?.content"
      :columns="columns"
      :loading="isFetching"
      v-model:sorting="sorting"
      :sorting-options="{ manualSorting: true }"
      class="h-full overscroll-none"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0 w-full',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'bg-elevated/50 py-2',
        td: 'border-b border-default py-2',
        separator: 'h-0',
      }"
    >
      <template #sourceName-header="{ column }">
        <SortableColumnHeader :column="column" label="Source" />
      </template>

      <template #title-header="{ column }">
        <SortableColumnHeader :column="column" label="Title" />
      </template>

      <template #createdAt-header="{ column }">
        <SortableColumnHeader :column="column" label="Date" />
      </template>

      <template #invalidIsbn-cell="{ row }">
        <UInput v-model="isbns[row.original.id]" class="font-mono" />
      </template>

      <template #sourceName-cell="{ row }">
        <UBadge variant="subtle" color="neutral">{{ row.getValue("sourceName") }}</UBadge>
      </template>

      <template #createdAt-cell="{ row }">
        {{ formatDate(row.original.createdAt, "HH:mm:ss DD.MM.YYYY") }}
      </template>

      <template #actions-cell="{ row }">
        <div class="flex gap-2">
          <ApprovePurgatoryBookButton
            :purgatoryBook="row.original"
            :isbn="isbns[row.original.id]"
            @refetchPurgatoryBooks="refetchPurgatoryBooks"
          />

          <UButton
            icon="i-lucide-rotate-ccw"
            color="neutral"
            variant="ghost"
            square
            @click="isbns[row.original.id] = row.original.invalidIsbn"
          />

          <DeletePurgatoryBookButton
            :purgatoryBook="row.original"
            @refetchPurgatoryBooks="refetchPurgatoryBooks"
          />

          <UButton
            icon="i-lucide-external-link"
            :to="row.original.url"
            target="_blank"
            square
            color="neutral"
            variant="ghost"
          />
        </div>
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
