<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import * as Sentry from "@sentry/vue";
import type { SortingState } from "@tanstack/table-core";
import { formatDate, refDebounced } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { computed, ref, useTemplateRef, watch } from "vue";

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
const selectedBookIds = ref<number[]>([]);

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
    Sentry.captureException(error, { tags: { context: "fetchPurgatoryBooks" } });
  }
});

const booksOnPage = computed(() => data.value?.content ?? []);
const selectableBookIds = computed(() => booksOnPage.value.map((book) => book.id));
const selectedBooks = computed(() =>
  booksOnPage.value.filter((book) => selectedBookIds.value.includes(book.id)),
);
const allBooksSelected = computed(
  () =>
    selectableBookIds.value.length > 0 &&
    selectedBookIds.value.length === selectableBookIds.value.length,
);
const someBooksSelected = computed(
  () => selectedBookIds.value.length > 0 && !allBooksSelected.value,
);

const toggleAllBooks = (checked: boolean | "indeterminate") => {
  selectedBookIds.value = checked === true ? [...selectableBookIds.value] : [];
};

const toggleBook = (id: number, checked: boolean | "indeterminate") => {
  if (checked === true) {
    if (!selectedBookIds.value.includes(id)) {
      selectedBookIds.value.push(id);
    }
  } else {
    selectedBookIds.value = selectedBookIds.value.filter((selectedId) => selectedId !== id);
  }
};

const refetchPurgatoryBooksAndClearSelection = async () => {
  await refetchPurgatoryBooks();
  selectedBookIds.value = [];
};

watch(selectableBookIds, (ids) => {
  const currentPageIds = new Set(ids);
  selectedBookIds.value = selectedBookIds.value.filter((id) => currentPageIds.has(id));
});

defineShortcuts({ "/": () => filterRef.value?.inputRef?.focus() });

const columns: TableColumn<PurgatoryBook>[] = [
  { id: "select", header: "", meta: { class: { th: "w-12" } } },
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

const resetIsbn = (book: PurgatoryBook) => {
  isbns.value[book.id] = book.invalidIsbn;
};
</script>

<template>
  <AppLayout>
    <template #header-controls>
      <BulkDeleteButton
        :items="selectedBooks"
        :get-key="(book) => book.id"
        :get-label="(book) => book.title"
        endpoint="/admin/purgatory/bulk"
        body-key="ids"
        @deleted="refetchPurgatoryBooksAndClearSelection"
      />

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
      :data="data?.content ?? []"
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
      <template #select-header>
        <UCheckbox
          :model-value="someBooksSelected ? 'indeterminate' : allBooksSelected"
          :disabled="!isOnline || !booksOnPage.length"
          aria-label="Select all purgatory books on page"
          @update:model-value="toggleAllBooks"
        />
      </template>

      <template #sourceName-header="{ column }">
        <SortableColumnHeader :column="column" label="Source" />
      </template>

      <template #title-header="{ column }">
        <SortableColumnHeader :column="column" label="Title" />
      </template>

      <template #createdAt-header="{ column }">
        <SortableColumnHeader :column="column" label="Date" />
      </template>

      <template #select-cell="{ row }">
        <UCheckbox
          :model-value="selectedBookIds.includes(row.original.id)"
          :disabled="!isOnline"
          @update:model-value="toggleBook(row.original.id, $event)"
        />
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
            @refetchPurgatoryBooks="refetchPurgatoryBooksAndClearSelection"
          />

          <UButton
            icon="i-lucide-rotate-ccw"
            color="neutral"
            variant="ghost"
            square
            @click="() => resetIsbn(row.original)"
          />

          <DeletePurgatoryBookButton
            :purgatoryBook="row.original"
            @refetchPurgatoryBooks="refetchPurgatoryBooksAndClearSelection"
          />

          <UButton
            icon="i-lucide-external-link"
            :to="row.original.url"
            target="_blank"
            rel="noopener noreferrer"
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
