<script setup lang="ts">
import { ref } from "vue";

import { useAuthedFetch } from "@/composables/useFetch";
import { showErrorToast, showSuccessToast } from "@/utils";
import type { Book } from "@/utils/types";

const BOOK_DELETE_ERROR_MESSAGE = "An error occurred while deleting the book.";

const props = defineProps<{ book: Book }>();
const emit = defineEmits<{ (e: "refetchBooks"): Promise<void> }>();

const deleteOpen = ref(false);
const deleting = ref(false);

const toast = useToast();
const fetch = useAuthedFetch();

const deleteBook = () => {
  deleting.value = true;

  fetch(`/books/${props.book.isbn}`, { method: "DELETE" })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || BOOK_DELETE_ERROR_MESSAGE);
      }

      return emit("refetchBooks");
    })
    .then(() => {
      deleteOpen.value = false;
      showSuccessToast(toast, "Book deleted successfully!");
    })
    .catch((error) => {
      console.error(error);
      showErrorToast(toast, error instanceof Error ? error.message : BOOK_DELETE_ERROR_MESSAGE);
    })
    .finally(() => (deleting.value = false));
};
</script>

<template>
  <UModal
    v-model:open="deleteOpen"
    :title="`Delete ${book.title} and its cover image?`"
    description="This action cannot be undone."
  >
    <UButton icon="i-lucide-trash-2" square color="error" variant="ghost" />

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="deleteOpen = false" />
        <UButton color="error" :loading="deleting" label="Delete" @click="deleteBook" />
      </div>
    </template>
  </UModal>
</template>
