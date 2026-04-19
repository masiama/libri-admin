<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { SortingState } from "@tanstack/table-core";
import { refDebounced } from "@vueuse/core";
import { computed, ref, toRef, watch } from "vue";

import ActionsCell from "./components/ActionsCell.vue";
import Header from "./components/Header.vue";
import SortableColumnHeader from "./components/SortableColumnHeader.vue";
import { useFetch } from "./composables/useFetch";
import { usePagination } from "./composables/usePagination";
import { store } from "./store";
import { showErrorToast } from "./utils";
import type { Book, Source } from "./utils/types";

const toast = useToast();

const search = toRef(store, "search");
const debouncedFilter = refDebounced(search, 300);

const sorting = ref<SortingState>([]);

const {
  page,
  data,
  isFetching,
  error: booksError,
  execute: refetchBooks,
} = usePagination<Book>("/books", { filter: debouncedFilter, sorting });

const { data: sources, error: sourcesError } = useFetch()("/sources").get().json<Source[]>();
const sourceOptions = computed(() => sources.value?.map((s) => s.name) ?? []);

watch(booksError, (error) => {
  if (error && error.name !== "AbortError") {
    showErrorToast(toast, "An error occurred while fetching books.");
    console.error(error);
  }
});

watch(sourcesError, (error) => {
  if (error && error.name !== "AbortError") {
    showErrorToast(toast, "An error occurred while fetching sources.");
    console.error(error);
  }
});

const columns: TableColumn<Book>[] = [
  { accessorKey: "isbn", header: "ISBN", meta: { class: { th: "w-36" } } },
  { accessorKey: "sourceName", meta: { class: { th: "w-36" } } },
  { accessorKey: "title", meta: { class: { td: "truncate" } } },
  { id: "actions", meta: { class: { th: "w-32" } } },
];
</script>

<template>
  <UApp :toaster="{ progress: false }">
    <div class="flex h-screen w-screen flex-col overflow-hidden">
      <Header />

      <UTable
        sticky
        :data="data?.content"
        :columns="columns"
        :loading="isFetching"
        v-model:sorting="sorting"
        :sorting-options="{ manualSorting: true }"
        class="grow overscroll-none"
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
          <ActionsCell
            :book="row.original"
            :source-options="sourceOptions"
            @refetchBooks="refetchBooks"
          />
        </template>
      </UTable>

      <div class="border-default flex items-center justify-between border-t px-4 py-2" v-if="data">
        <div class="text-default/50 text-xs">
          Copyright © {{ new Date().getFullYear() }} Leonid Cupikov
        </div>
        <UPagination
          v-model:page="page"
          :total="data?.page.totalElements"
          :items-per-page="data?.page.size"
        />
      </div>
    </div>
  </UApp>
</template>
