<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";

import { useAuthedFetch } from "@/composables/useFetch";
import { useApiStatusStore } from "@/stores/apiStatus";
import { catchPromiseError, showSuccessToast } from "@/utils";
import type { PurgatoryBook } from "@/utils/types";

const PURGATORY_BOOK_APPROVE_ERROR_MESSAGE =
  "An error occurred while approving the purgatory book.";

const props = defineProps<{ purgatoryBook: PurgatoryBook; isbn: string | undefined }>();
const emit = defineEmits<{ (e: "refetchPurgatoryBooks"): Promise<void> }>();

const approveOpen = ref(false);

const toast = useToast();
const fetch = useAuthedFetch();
const { isOnline } = storeToRefs(useApiStatusStore());

const approveBook = () =>
  fetch(`/admin/purgatory/${props.purgatoryBook.id}/approve`, { method: "POST", body: props.isbn })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || PURGATORY_BOOK_APPROVE_ERROR_MESSAGE);
      }

      return emit("refetchPurgatoryBooks");
    })
    .then(() => {
      approveOpen.value = false;
      showSuccessToast(toast, "Purgatory book approved successfully!");
    })
    .catch(catchPromiseError(toast, PURGATORY_BOOK_APPROVE_ERROR_MESSAGE));
</script>

<template>
  <UModal
    v-model:open="approveOpen"
    :title="`Approve ${purgatoryBook.title}?`"
    description="This action cannot be undone."
  >
    <UButton
      icon="i-lucide-check"
      square
      color="success"
      variant="ghost"
      :disabled="!isOnline || !isbn"
    />

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Cancel" @click="approveOpen = false" />
        <UButton
          color="success"
          label="Approve"
          @click="approveBook"
          loading-auto
          :disabled="!isOnline || !isbn"
        />
      </div>
    </template>
  </UModal>
</template>
