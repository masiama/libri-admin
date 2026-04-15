<script setup lang="ts">
import { SignInButton, useAuth, UserButton } from "@clerk/vue";
import type { FormSubmitEvent, TableColumn } from "@nuxt/ui";
import type { SortingState } from "@tanstack/table-core";
import { refDebounced } from "@vueuse/core";
import { computed, ref, resolveComponent, useTemplateRef, watch } from "vue";
import * as z from "zod";

import Logo from "@/assets/logo.svg?component";

import SortableColumnHeader from "./components/SortableColumnHeader.vue";
import { useAuthedFetch, useFetch } from "./composables/useFetch";
import { usePagination } from "./composables/usePagination";

const BASE_URL = import.meta.env.VITE_API_BASE;

type Source = {
  name: string;
  priority: number;
  enabled: boolean;
};

const BookSchema = z.object({
  isbn: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  url: z.url(),
  sourceName: z.string(),
});
type Book = z.infer<typeof BookSchema>;

const { isSignedIn } = useAuth();
const toast = useToast();

const fetch = useAuthedFetch();

const startCrawlers = () =>
  fetch("/admin/crawl", { method: "POST" })
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
  execute: refetchBooks,
} = usePagination<Book>("/books", { filter: debouncedFilter, sorting });

const { data: sources, error: sourcesError } = useFetch()("/sources").get().json<Source[]>();
const sourceOptions = computed(
  () => sources.value?.map((s) => ({ label: s.name, value: s.name })) ?? [],
);

watch(booksError, (error) => {
  if (error && error.name !== "AbortError") {
    toast.add({
      title: "Error",
      description: "An error occurred while fetching books.",
      color: "error",
      icon: "i-lucide-triangle-alert",
    });
    console.error(error);
  }
});

watch(sourcesError, (error) => {
  if (error && error.name !== "AbortError") {
    toast.add({
      title: "Error",
      description: "An error occurred while fetching sources.",
      color: "error",
      icon: "i-lucide-triangle-alert",
    });
    console.error(error);
  }
});

const columns: TableColumn<Book>[] = [
  { accessorKey: "isbn", header: "ISBN", meta: { class: { th: "w-36" } } },
  { accessorKey: "sourceName", meta: { class: { th: "w-36" } } },
  { accessorKey: "title", meta: { class: { td: "truncate" } } },
  { id: "actions", meta: { class: { th: "w-32" } } },
];

const submitting = ref(false);
const editingBook = ref<Book>();
const editingBookImage = ref<File>();

watch(editingBook, () => (editingBookImage.value = undefined));

const cloneBook = (book: Book): Book => ({ ...book, authors: [...book.authors] });

const startEditingBook = (book: Book) => {
  editingBook.value = cloneBook(book);
};

const createObjectUrl = (file: File) => URL.createObjectURL(file);

const onSubmit = (event: FormSubmitEvent<Book>) => {
  submitting.value = true;
  const formData = new FormData();

  formData.append("book", new Blob([JSON.stringify(event.data)], { type: "application/json" }));

  if (editingBookImage.value) {
    formData.append("file", editingBookImage.value);
  }

  return fetch(`/books/${event.data.isbn}`, { method: "PUT", body: formData })
    .then((response) => response.json())
    .then(refetchBooks)
    .then(() => {
      editingBook.value = undefined;
      toast.add({
        title: "Success",
        description: "Book updated successfully!",
        color: "success",
        icon: "i-lucide-check",
      });
    })
    .catch((error) => {
      console.error(error);
      toast.add({
        title: "Error",
        description: "An error occurred while updating the book.",
        color: "error",
        icon: "i-lucide-triangle-alert",
      });
    })
    .finally(() => (submitting.value = false));
};
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
          <div class="flex gap-2">
            <USlideover
              :open="editingBook?.isbn === row.original.isbn"
              @update:open="editingBook = $event ? editingBook : undefined"
            >
              <UButton
                icon="i-lucide-pencil"
                square
                color="neutral"
                variant="ghost"
                @click="startEditingBook(row.original)"
              />

              <template #title>Edit Book</template>

              <template #body>
                <UForm
                  v-if="editingBook"
                  id="edit-form"
                  :schema="BookSchema"
                  :state="editingBook"
                  class="space-y-4"
                  @submit="onSubmit"
                >
                  <UFormField>
                    <UFileUpload v-slot="{ open }" v-model="editingBookImage" accept="image/jpeg">
                      <UCard class="flex h-50" :ui="{ body: 'sm:p-2 p-2' }">
                        <img
                          :src="
                            editingBookImage
                              ? createObjectUrl(editingBookImage)
                              : `${BASE_URL}/api/v1/images/${editingBook.isbn}.jpg`
                          "
                          alt="Book Cover"
                          class="h-full w-full cursor-pointer object-contain"
                          @click="open()"
                        />
                      </UCard>
                    </UFileUpload>
                  </UFormField>

                  <UFormField label="ISBN" name="isbn">
                    <UInput v-model="editingBook.isbn" disabled class="w-full" />
                  </UFormField>

                  <UFormField label="Title" name="title" required>
                    <UInput v-model="editingBook.title" class="w-full" />
                  </UFormField>

                  <UFormField label="Authors" name="authors">
                    <UInputTags v-model="editingBook.authors" class="w-full" />
                  </UFormField>

                  <UFormField label="URL" name="url" required>
                    <UInput v-model="editingBook.url" class="w-full" />
                  </UFormField>

                  <UFormField label="Source" name="source" required>
                    <USelect
                      v-model="editingBook.sourceName"
                      :items="sourceOptions"
                      class="w-full"
                    />
                  </UFormField>
                </UForm>
              </template>

              <template #footer>
                <UButton type="submit" form="edit-form" :loading="submitting">Submit</UButton>
              </template>
            </USlideover>
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
