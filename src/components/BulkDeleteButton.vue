<script setup lang="ts" generic="T, K extends string | number">
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { useApiStatusStore } from "@/stores/apiStatus";
import { catchPromiseError, showSuccessToast } from "@/utils";

const props = defineProps<{
  items: T[];
  getKey: (item: T) => K;
  getLabel: (item: T) => string;
  onDelete: (keys: K[]) => Promise<unknown>;
}>();
const emit = defineEmits<{ (e: "deleted"): void | Promise<void> }>();

const deleteOpen = ref(false);
const deleting = ref(false);

const toast = useToast();
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

  return props
    .onDelete(selectedKeys.value)
    .then(() => emit("deleted"))
    .then(() => {
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
