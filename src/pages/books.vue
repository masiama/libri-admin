<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from "@nuxt/ui";
import type { Row, SortingState } from "@tanstack/table-core";
import { h, ref, resolveComponent } from "vue";

import SortableColumnHeader from "@/components/SortableColumnHeader.vue";
import { usePagination } from "@/composables/usePagination";

type Book = {
  isbn: string;
  title: string;
  authors: string[];
  url: string;
  sourceName: string;
};

const UButton = resolveComponent("UButton");

const sorting = ref<SortingState>([]);

const { page, data, isLoading } = usePagination<Book>("/books", sorting);

const columns: TableColumn<Book>[] = [
  { accessorKey: "isbn", header: "ISBN", meta: { class: { td: "w-30" } } },
  {
    accessorKey: "title",
    header: ({ column }) => h(SortableColumnHeader, { column, label: "Title" }),
  },
  {
    id: "actions",
    meta: { class: { td: "w-16" } },
    cell: ({ row }) =>
      h(UButton, {
        icon: "i-lucide-external-link",
        color: "neutral",
        variant: "ghost",
        to: row.original.url,
        target: "_blank",
      }),
  },
];
</script>

<template>
  <UDashboardPanel id="books">
    <template #body>
      <UTable
        sticky
        :data="data?.content"
        :columns="columns"
        :loading="isLoading"
        v-model:sorting="sorting"
        :sorting-options="{ manualSorting: true }"
        class="flex-1 overscroll-none"
      />
      <div class="border-default flex justify-end border-t px-4 pt-4">
        <UPagination v-model:page="page" :total="data?.page.totalPages" />
      </div>
    </template>
  </UDashboardPanel>
</template>
