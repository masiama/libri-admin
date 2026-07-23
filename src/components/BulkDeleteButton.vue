<script setup lang="ts" generic="T">
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { useAuthedFetch } from "@/composables/useFetch";
import { useApiStatusStore } from "@/stores/apiStatus";
import { catchPromiseError, showSuccessToast } from "@/utils";

const props = defineProps<{
  items: T[];
  getKey: (item: T) => string | number;
  getLabel: (item: T) => string;
  endpoint: string;
  bodyKey: string;
}>();
const emit = defineEmits<{ (e: "deleted"): void | Promise<void> }>();

const deleteOpen = ref(false);
const deleting = ref(false);

const toast = useToast();
const fetch = useAuthedFetch();
const { isOnline } = storeToRefs(useApiStatusStore());

const selectedCount = computed(() => props.items.length);
const selectedKeys = computed(() => props.items.map(props.getKey));
const selectionLabel = computed(() =>
  selectedCount.value === 1 ? props.getLabel(props.items[0] as T) : `${selectedCount.value} books`,
);
const modalTitle = computed(() =>
  selectedCount.value === 1
    ? `Delete ${selectionLabel.value} and its cover image?`
    : `Delete ${selectionLabel.value} and their cover images?`,
);

const closeDelete = () => {
  deleteOpen.value = false;
};

const deleteItems = () => {
  if (!selectedKeys.value.length) {
    return;
  }

  const count = selectedCount.value;
  const deleteErrorMessage = `An error occurred while deleting the selected ${count === 1 ? "book" : "books"}.`;

  deleting.value = true;

  return fetch(props.endpoint, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [props.bodyKey]: selectedKeys.value }),
  })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || deleteErrorMessage);
      }

      await emit("deleted");
      deleteOpen.value = false;
      showSuccessToast(toast, `${count === 1 ? "Book" : `${count} books`} deleted successfully!`);
    })
    .catch(catchPromiseError(toast, deleteErrorMessage))
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
        <UButton color="neutral" variant="ghost" label="Cancel" @click="closeDelete" />
        <UButton
          color="error"
          :loading="deleting"
          :label="selectedCount === 1 ? 'Delete book' : `Delete ${selectedCount} books`"
          :disabled="!isOnline || !selectedCount"
          @click="deleteItems"
        />
      </div>
    </template>
  </UModal>
</template>
