<script setup lang="ts">
import type { Column } from "@tanstack/table-core";

const props = defineProps<{ column: Column<any>; label: string }>();

const isSorted = props.column.getIsSorted();
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    :label="label"
    :icon="
      isSorted
        ? isSorted === 'asc'
          ? 'i-lucide-arrow-up-narrow-wide'
          : 'i-lucide-arrow-down-wide-narrow'
        : 'i-lucide-arrow-up-down'
    "
    class="-mx-2.5"
    @click="() => column.toggleSorting(column.getIsSorted() === 'asc')"
  />
</template>
