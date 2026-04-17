<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { ref, watch } from "vue";

import { useAuthedFetch } from "@/composables/useFetch";
import { cloneBook, showErrorToast, showSuccessToast } from "@/utils";
import { type Book } from "@/utils/types";

const props = defineProps<{ book: Book; sourceOptions: string[] }>();
const emit = defineEmits<{ (e: "refetchBooks"): Promise<void> }>();

const toast = useToast();
const fetch = useAuthedFetch();

const submitting = ref(false);
const editingBook = ref<Book>();
const editingBookImage = ref<File>();

watch(editingBook, () => (editingBookImage.value = undefined));

const onSubmit = (event: FormSubmitEvent<Book>) => {
  submitting.value = true;
  const formData = new FormData();

  formData.append("book", new Blob([JSON.stringify(event.data)], { type: "application/json" }));

  if (editingBookImage.value) {
    formData.append("file", editingBookImage.value);
  }

  fetch(`/books/${event.data.isbn}`, { method: "PUT", body: formData })
    .then(() => emit("refetchBooks"))
    .then(() => {
      editingBook.value = undefined;
      showSuccessToast(toast, "Book updated successfully!");
    })
    .catch((error) => {
      console.error(error);
      showErrorToast(
        toast,
        error instanceof Error ? error.message : "An error occurred while updating the book.",
      );
    })
    .finally(() => (submitting.value = false));
};
</script>

<template>
  <div class="flex gap-2">
    <USlideover
      :open="editingBook?.isbn === book.isbn"
      @update:open="editingBook = $event ? editingBook : undefined"
    >
      <UButton
        icon="i-lucide-pencil"
        square
        color="neutral"
        variant="ghost"
        @click="editingBook = cloneBook(book)"
      />

      <template #title>Edit Book</template>

      <template #body>
        <BookEditForm
          v-if="editingBook"
          :book="editingBook"
          :book-image="editingBookImage"
          form-id="edit-form"
          :source-options="sourceOptions"
          @submit="onSubmit"
        />
      </template>

      <template #footer>
        <UButton type="submit" form="edit-form" :loading="submitting">Submit</UButton>
      </template>
    </USlideover>

    <UButton
      icon="i-lucide-external-link"
      :to="book.url"
      target="_blank"
      square
      color="neutral"
      variant="ghost"
    />
  </div>
</template>
