<script setup lang="ts">
import BookUpsertSlideover from "@/components/BookUpsertSlideover.vue";
import type { Book } from "@/utils/types";

defineProps<{ book: Book; sourceOptions: string[] }>();
defineEmits<{ (e: "refetchBooks"): Promise<void> }>();
</script>

<template>
  <div class="flex gap-2">
    <BookUpsertSlideover
      :book="book"
      :source-options="sourceOptions"
      @saved="$emit('refetchBooks')"
    >
      <template #default="{ onClick }">
        <UButton icon="i-lucide-pencil" square color="neutral" variant="ghost" @click="onClick" />
      </template>
    </BookUpsertSlideover>

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
