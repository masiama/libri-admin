<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { h, resolveComponent } from "vue";

import { usePagination } from "@/composables/usePagination";

type Book = {
  isbn: string;
  title: string;
  authors: string[];
  url: string;
  sourceName: string;
};

const UButton = resolveComponent("UButton");

const { page, data, isLoading } = usePagination<Book>("/books");

const columns: TableColumn<Book>[] = [
  { accessorKey: "isbn", header: "ISBN", meta: { class: { td: "w-30" } } },
  { accessorKey: "title", header: "Title" },
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
        :loading="isLoading"
        :data="data?.content"
        :columns="columns"
        class="flex-1 overscroll-none"
      />
      <div class="border-default flex justify-end border-t px-4 pt-4">
        <UPagination v-model:page="page" :total="data?.page.totalPages" />
      </div>
    </template>
  </UDashboardPanel>
</template>
