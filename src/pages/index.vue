<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { SortingState } from "@tanstack/table-core";
import { refDebounced } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { ref, useTemplateRef, watch } from "vue";

import AppLayout from "@/components/AppLayout.vue";
import BookUpsertSlideover from "@/components/BookUpsertSlideover.vue";
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

defineShortcuts({ "/": () => filterRef.value?.inputRef?.focus() });

const columns: TableColumn<Book>[] = [
  { accessorKey: "isbn", header: "ISBN", meta: { class: { th: "w-36" } } },
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
      <template #sourceName-header="{ column }">
        <SortableColumnHeader :column="column" label="Source" />
      </template>

      <template #title-header="{ column }">
        <SortableColumnHeader :column="column" label="Title" />
      </template>

      <template #sourceName-cell="{ row }">
        <UBadge variant="subtle" color="neutral">{{ row.getValue("sourceName") }}</UBadge>
      </template>

      <template #actions-cell="{ row }">
        <ActionsCell :book="row.original" @refetchBooks="refetchBooks" />
      </template>
    </UTable>

    <template #footer-controls>
      <UPagination
        v-if="data"
        v-model:page="page"
        :total="data.page.totalElements"
        :items-per-page="data.page.size"
        :disabled="!isOnline"
      />
    </template>
  </AppLayout>
</template>
