<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { SortingState } from "@tanstack/table-core";
import { refDebounced } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { computed, ref, useTemplateRef, watch } from "vue";

import AppLayout from "@/components/AppLayout.vue";
import BooksActionsCell from "@/components/BooksActionsCell.vue";
import BookUpsertSlideover from "@/components/BookUpsertSlideover.vue";
import BulkDeleteBooksButton from "@/components/BulkDeleteBooksButton.vue";
import { usePagination } from "@/composables/usePagination";
import { useApiStatusStore } from "@/stores/apiStatus";
import { showErrorToast } from "@/utils";
import { BookSchema, type Book } from "@/utils/types";

const toast = useToast();
const { isOnline } = storeToRefs(useApiStatusStore());

const search = ref("");
const debouncedFilter = refDebounced(search, 300);
const filterRef = useTemplateRef("filter");

const sorting = ref<SortingState>([]);
const selectedBookIsbns = ref<string[]>([]);

const {
  page,
  data,
  isFetching,
  error: booksError,
  execute: refetchBooks,
} = usePagination("/books", BookSchema, { filter: debouncedFilter, sorting });

watch(booksError, (error) => {
  if (error && error.name !== "AbortError") {
    showErrorToast(toast, "An error occurred while fetching books.");
    console.error(error);
  }
});

const booksOnPage = computed(() => data.value?.content ?? []);
const selectableBookIsbns = computed(() => booksOnPage.value.map((book) => book.isbn));
const selectedBooks = computed(() =>
  booksOnPage.value.filter((book) => selectedBookIsbns.value.includes(book.isbn)),
);
const allBooksSelected = computed(
  () =>
    selectableBookIsbns.value.length > 0 &&
    selectedBookIsbns.value.length === selectableBookIsbns.value.length,
);
const someBooksSelected = computed(
  () => selectedBookIsbns.value.length > 0 && !allBooksSelected.value,
);

const toggleAllBooks = (checked: boolean | "indeterminate") => {
  selectedBookIsbns.value = checked === true ? [...selectableBookIsbns.value] : [];
};

const toggleBook = (isbn: string, checked: boolean | "indeterminate") => {
  if (checked === true) {
    if (!selectedBookIsbns.value.includes(isbn)) {
      selectedBookIsbns.value.push(isbn);
    }
  } else {
    selectedBookIsbns.value = selectedBookIsbns.value.filter(
      (selectedIsbn) => selectedIsbn !== isbn,
    );
  }
};

const refetchBooksAndClearSelection = async () => {
  await refetchBooks();
  selectedBookIsbns.value = [];
};

watch(selectableBookIsbns, (isbns) => {
  const currentPageIsbns = new Set(isbns);
  selectedBookIsbns.value = selectedBookIsbns.value.filter((isbn) => currentPageIsbns.has(isbn));
});

defineShortcuts({ "/": () => filterRef.value?.inputRef?.focus() });

const columns: TableColumn<Book>[] = [
  { id: "select", header: "", meta: { class: { th: "w-12" } } },
  { accessorKey: "isbn", header: "ISBN", meta: { class: { th: "w-36", td: "font-mono" } } },
  { accessorKey: "sourceName", meta: { class: { th: "w-36" } } },
  { accessorKey: "title", meta: { class: { td: "truncate" } } },
  { id: "actions", meta: { class: { th: "w-36" } } },
];
</script>

<template>
  <AppLayout>
    <template #header-controls>
      <BookUpsertSlideover @saved="refetchBooks">
        <template #default="{ onClick }">
          <UButton
            icon="i-lucide-plus"
            class="rounded-full"
            :disabled="!isOnline"
            @click="onClick"
          />
        </template>
      </BookUpsertSlideover>

      <BulkDeleteBooksButton :books="selectedBooks" @deleted="refetchBooksAndClearSelection" />

      <UInput
        ref="filter"
        v-model="search"
        class="max-w-sm"
        icon="i-lucide-search"
        placeholder="Filter books..."
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
      <template #select-header>
        <UCheckbox
          :model-value="someBooksSelected ? 'indeterminate' : allBooksSelected"
          :disabled="!isOnline || !booksOnPage.length"
          aria-label="Select all books on page"
          @update:model-value="toggleAllBooks"
        />
      </template>

      <template #sourceName-header="{ column }">
        <SortableColumnHeader :column="column" label="Source" />
      </template>

      <template #title-header="{ column }">
        <SortableColumnHeader :column="column" label="Title" />
      </template>

      <template #select-cell="{ row }">
        <UCheckbox
          :model-value="selectedBookIsbns.includes(row.original.isbn)"
          :disabled="!isOnline"
          @update:model-value="toggleBook(row.original.isbn, $event)"
        />
      </template>

      <template #sourceName-cell="{ row }">
        <UBadge variant="subtle" color="neutral">{{ row.getValue("sourceName") }}</UBadge>
      </template>

      <template #actions-cell="{ row }">
        <BooksActionsCell :book="row.original" @refetchBooks="refetchBooksAndClearSelection" />
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
