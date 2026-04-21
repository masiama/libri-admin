<script setup lang="ts">
import { useApiStatusPolling } from "@/composables/useApiStatusPolling";
import { useLoadSources } from "@/composables/useLoadSources";

useApiStatusPolling();
useLoadSources();
</script>

<template>
  <UApp :toaster="{ progress: false }">
    <RouterView />
  </UApp>
</template>
