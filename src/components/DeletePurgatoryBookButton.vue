<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";

import { useAuthedFetch } from "@/composables/useFetch";
import { useApiStatusStore } from "@/stores/apiStatus";
import { catchPromiseError, showSuccessToast } from "@/utils";
import type { PurgatoryBook } from "@/utils/types";

const PURGATORY_BOOK_DELETE_ERROR_MESSAGE = "An error occurred while deleting the purgatory book.";

const props = defineProps<{ purgatoryBook: PurgatoryBook }>();
const emit = defineEmits<{ (e: "refetchPurgatoryBooks"): Promise<void> }>();

const deleteOpen = ref(false);

const toast = useToast();
const fetch = useAuthedFetch();
const { isOnline } = storeToRefs(useApiStatusStore());

const deleteBook = () =>
  fetch(`/admin/purgatory/${props.purgatoryBook.id}`, { method: "DELETE" })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || PURGATORY_BOOK_DELETE_ERROR_MESSAGE);
      }

      return emit("refetchPurgatoryBooks");
    })
    .then(() => {
      deleteOpen.value = false;
      showSuccessToast(toast, "Purgatory book deleted successfully!");
    })
    .catch(catchPromiseError(toast, PURGATORY_BOOK_DELETE_ERROR_MESSAGE));
</script>

<template>
  <UModal
    v-model:open="deleteOpen"
    :title="`Delete ${purgatoryBook.title} and its cover image?`"
    description="This action cannot be undone."
  >
    <UButton icon="i-lucide-trash-2" square color="error" variant="ghost" :disabled="!isOnline" />

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="deleteOpen = false" />
        <UButton
          color="error"
          label="Delete"
          @click="deleteBook"
          loading-auto
          :disabled="!isOnline"
        />
      </div>
    </template>
  </UModal>
</template>
