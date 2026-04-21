<script setup lang="ts">
import type { Column } from "@tanstack/table-core";
import { storeToRefs } from "pinia";

import { useApiStatusStore } from "@/stores/apiStatus";

defineProps<{ column: Column<any>; label: string }>();

const { isOnline } = storeToRefs(useApiStatusStore());
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    :label="label"
    :icon="
      column.getIsSorted()
        ? column.getIsSorted() === 'asc'
          ? 'i-lucide-arrow-up-narrow-wide'
          : 'i-lucide-arrow-down-wide-narrow'
        : 'i-lucide-arrow-up-down'
    "
    class="-mx-2.5"
    @click="() => column.toggleSorting(column.getIsSorted() === 'asc')"
    :disabled="!isOnline"
  />
</template>
