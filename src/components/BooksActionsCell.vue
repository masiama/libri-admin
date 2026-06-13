<script setup lang="ts">
import type { Book } from "@/utils/types";

defineProps<{ book: Book }>();
defineEmits<{ (e: "refetchBooks"): Promise<void> }>();
</script>

<template>
  <div class="flex gap-2">
    <BookUpsertSlideover :book="book" @saved="$emit('refetchBooks')">
      <template #default="{ onClick }">
        <UButton icon="i-lucide-pencil" square color="neutral" variant="ghost" @click="onClick" />
      </template>
    </BookUpsertSlideover>

    <DeleteBookButton :book="book" @refetchBooks="$emit('refetchBooks')" />

    <UButton
      icon="i-lucide-external-link"
      :to="book.url"
      target="_blank"
      rel="noopener noreferrer"
      square
      color="neutral"
      variant="ghost"
    />
  </div>
</template>
