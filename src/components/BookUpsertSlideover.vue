<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { computed, ref, useId, watch } from "vue";

import { useAuthedFetch } from "@/composables/useFetch";
import { cloneBook, createEmptyBook, showErrorToast, showSuccessToast } from "@/utils";
import { type Book } from "@/utils/types";

const props = defineProps<{ book?: Book; sourceOptions: string[] }>();
const emit = defineEmits<{ (e: "saved"): Promise<void> }>();

const toast = useToast();
const fetch = useAuthedFetch();

const formId = useId();
const submitting = ref(false);
const formBook = ref<Book>();
const formBookImage = ref<File>();

const isEditMode = computed(() => !!props.book);
const isSubmitDisabled = computed(() => !isEditMode.value && !formBookImage.value);
const slideoverTitle = computed(() => (isEditMode.value ? "Edit Book" : "Add Book"));
const submitSuccessMessage = computed(() =>
  isEditMode.value ? "Book updated successfully!" : "Book created successfully!",
);
const submitErrorMessage = computed(() =>
  isEditMode.value
    ? "An error occurred while updating the book."
    : "An error occurred while creating the book.",
);

watch(formBook, () => (formBookImage.value = undefined));

const onSubmit = (event: FormSubmitEvent<Book>) => {
  if (!isEditMode.value && !formBookImage.value) {
    showErrorToast(toast, "Cover image is required when creating a book.");
    return;
  }

  submitting.value = true;
  const formData = new FormData();

  formData.append("book", new Blob([JSON.stringify(event.data)], { type: "application/json" }));

  if (formBookImage.value) {
    formData.append("file", formBookImage.value);
  }

  const requestPath = isEditMode.value ? `/admin/books/${event.data.isbn}` : "/admin/books";
  const requestMethod = isEditMode.value ? "PUT" : "POST";

  fetch(requestPath, { method: requestMethod, body: formData })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || submitErrorMessage.value);
      }

      return emit("saved");
    })
    .then(() => {
      formBook.value = undefined;
      showSuccessToast(toast, submitSuccessMessage.value);
    })
    .catch((error) => {
      console.error(error);
      showErrorToast(toast, error instanceof Error ? error.message : submitErrorMessage.value);
    })
    .finally(() => (submitting.value = false));
};
</script>

<template>
  <USlideover :open="!!formBook" @update:open="formBook = $event ? formBook : undefined">
    <slot @click="formBook = book ? cloneBook(book) : createEmptyBook()" />

    <template #title>{{ slideoverTitle }}</template>

    <template #body>
      <BookEditForm
        v-if="formBook"
        v-model:book="formBook"
        v-model:book-image="formBookImage"
        :form-id="formId"
        :source-options="sourceOptions"
        :isbn-disabled="isEditMode"
        :image-required="!isEditMode"
        @submit="onSubmit"
      />
    </template>

    <template #footer>
      <UButton
        type="submit"
        :form="formId"
        :loading="submitting"
        :disabled="isSubmitDisabled"
        label="Submit"
      />
    </template>
  </USlideover>
</template>
