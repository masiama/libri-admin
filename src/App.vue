<script setup lang="ts">
import { SignInButton, useAuth, UserButton } from "@clerk/vue";
import type { TableColumn } from "@nuxt/ui";
import type { SortingState } from "@tanstack/table-core";
import { refDebounced } from "@vueuse/core";
import { h, ref, resolveComponent, useTemplateRef, watch } from "vue";

import Logo from "@/assets/logo.svg?component";

import SortableColumnHeader from "./components/SortableColumnHeader.vue";
import { useFetch } from "./composables/useFetch";
import { usePagination } from "./composables/usePagination";

type Book = {
  isbn: string;
  title: string;
  authors: string[];
  url: string;
  sourceName: string;
};

const { isSignedIn } = useAuth();
const toast = useToast();

const { execute } = useFetch()("/admin/crawl", { immediate: false }).post();

const startCrawlers = () =>
  execute(true)
    .then(() => {
      toast.add({ title: "Success", description: "Crawlers started successfully!" });
    })
    .catch((error) => {
      console.error(error);
      toast.add({ title: "Error", description: "An error occurred while starting the crawlers." });
    });

const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");

const filterRef = useTemplateRef("filter");
const filter = ref("");
const debouncedFilter = refDebounced(filter, 300);

defineShortcuts({ "/": () => filterRef.value?.inputRef?.focus() });

const sorting = ref<SortingState>([]);

const {
  page,
  data,
  isFetching,
  error: booksError,
} = usePagination<Book>("/books", { filter: debouncedFilter, sorting });

watch(booksError, (error) => {
  if (error) {
    toast.add({
      title: "Error",
      description: "An error occurred while fetching books.",
      color: "error",
      icon: "i-lucide-triangle-alert",
    });
    console.error(error);
  }
});

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
        h(UButton, {
          icon: "i-lucide-store",
          to: row.original.url,
          target: "_blank",
          color: "default",
          variant: "ghost",
        }),
      ),
  },
];
</script>

<template>
  <UApp :toaster="{ progress: false }">
    <div class="flex h-screen w-screen flex-col overflow-hidden">
      <header class="border-default h-(--ui-header-height) shrink-0 border-b">
        <div class="flex h-full w-full items-center justify-between gap-3 px-4">
          <div class="flex items-center gap-2" aria-label="Libri Admin">
            <Logo class="text-primary h-6 w-6" />
            <span class="text-lg font-semibold">Libri Admin</span>
          </div>
          <div class="flex items-center gap-4">
            <UButton icon="i-lucide-refresh-ccw" class="rounded-full" @click="startCrawlers" />

            <UInput
              ref="filter"
              v-model="filter"
              class="max-w-sm"
              icon="i-lucide-search"
              placeholder="Filter books..."
            >
              <template #trailing>
                <UKbd value="/" />
              </template>
            </UInput>

            <UserButton v-if="isSignedIn" />
            <SignInButton v-else mode="modal">
              <UAvatar icon="i-lucide-user" class="cursor-pointer" />
            </SignInButton>
          </div>
        </div>
      </header>

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
      />

      <div class="border-default flex justify-end border-t px-4 py-2" v-if="data">
        <UPagination
          v-model:page="page"
          :total="data?.page.totalElements"
          :items-per-page="data?.page.size"
        />
      </div>
    </div>
  </UApp>
</template>
