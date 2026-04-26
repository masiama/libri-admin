<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { useAuthedFetch } from "@/composables/useFetch";
import { useApiStatusStore } from "@/stores/apiStatus";
import { catchPromiseError, showSuccessToast } from "@/utils";
import type { Book } from "@/utils/types";

const BOOKS_DELETE_ERROR_MESSAGE = "An error occurred while deleting the selected books.";

const props = defineProps<{ books: Book[] }>();
const emit = defineEmits<{ (e: "deleted"): void | Promise<void> }>();

const deleteOpen = ref(false);
const deleting = ref(false);

const toast = useToast();
const fetch = useAuthedFetch();
const { isOnline } = storeToRefs(useApiStatusStore());

const selectedCount = computed(() => props.books.length);
const selectedIsbns = computed(() => props.books.map((book) => book.isbn));
const selectionLabel = computed(() =>
  selectedCount.value === 1 ? (props.books[0]?.title ?? "1 book") : `${selectedCount.value} books`,
);
const modalTitle = computed(() =>
  selectedCount.value === 1
    ? `Delete ${selectionLabel.value} and its cover image?`
    : `Delete ${selectionLabel.value} and their cover images?`,
);

const deleteBooks = () => {
  if (!selectedIsbns.value.length) {
    return;
  }

  const count = selectedCount.value;

  deleting.value = true;

  return fetch("/admin/books/bulk", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isbns: selectedIsbns.value }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || BOOKS_DELETE_ERROR_MESSAGE);
      }

      await emit("deleted");
      deleteOpen.value = false;
      showSuccessToast(toast, `${count === 1 ? "Book" : `${count} books`} deleted successfully!`);
    })
    .catch(catchPromiseError(toast, BOOKS_DELETE_ERROR_MESSAGE))
    .finally(() => (deleting.value = false));
};
</script>

<template>
  <UModal v-model:open="deleteOpen" :title="modalTitle" description="This action cannot be undone.">
    <UButton
      icon="i-lucide-trash-2"
      color="error"
      :label="selectedCount ? `Delete (${selectedCount})` : 'Delete'"
      :disabled="!isOnline || !selectedCount"
    />

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="deleteOpen = false" />
        <UButton
          color="error"
          :loading="deleting"
          :label="selectedCount === 1 ? 'Delete book' : `Delete ${selectedCount} books`"
          :disabled="!isOnline || !selectedCount"
          @click="deleteBooks"
        />
      </div>
    </template>
  </UModal>
</template>
