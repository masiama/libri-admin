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
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const sorting = ref<SortingState>([]);

const { page, data, isLoading } = usePagination<Book>("/books", sorting);

const getRowItems = (row: Row<Book>): DropdownMenuItem[] => [
  { type: "label", label: "Actions" },
  { label: "View on source", icon: "i-lucide-store", to: row.original.url, target: "_blank" },
];

const columns: TableColumn<Book>[] = [
  { accessorKey: "isbn", header: "ISBN", meta: { class: { th: "w-36" } } },
  {
    accessorKey: "sourceName",
    header: ({ column }) => h(SortableColumnHeader, { column, label: "Source" }),
    cell: ({ row }) =>
      h(UBadge, { variant: "subtle", color: "neutral" }, () => row.getValue("sourceName")),
    meta: { class: { th: "w-36" } },
  },
  {
    accessorKey: "title",
    header: ({ column }) => h(SortableColumnHeader, { column, label: "Title" }),
    meta: { class: { td: "truncate" } },
  },
  {
    id: "actions",
    meta: { class: { th: "w-16" } },
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(UDropdownMenu, { content: { align: "end" }, items: getRowItems(row) }, () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            class: "ml-auto",
          }),
        ),
      ),
  },
];
</script>

<template>
  <UDashboardPanel id="books">
    <template #header>
      <UDashboardNavbar title="Books">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable
        sticky
        :data="data?.content"
        :columns="columns"
        :loading="isLoading"
        v-model:sorting="sorting"
        :sorting-options="{ manualSorting: true }"
        class="border-default flex-1 overscroll-none border-b"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0 w-full',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'bg-elevated/50 py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default py-2',
          separator: 'h-0',
        }"
      />
      <div class="flex justify-end">
        <UPagination v-model:page="page" :total="data?.page.totalPages" />
      </div>
    </template>
  </UDashboardPanel>
</template>
