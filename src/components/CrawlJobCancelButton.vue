<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";

import { useAuthedFetch } from "@/composables/useFetch";
import { useApiStatusStore } from "@/stores/apiStatus";
import { catchPromiseError, showSuccessToast } from "@/utils";
import type { CrawlJob } from "@/utils/types";

const props = defineProps<{ job: CrawlJob }>();

const CRAWLER_CANCEL_ERROR_MESSAGE = "Failed to cancel crawler.";

const toast = useToast();
const fetch = useAuthedFetch();
const { isOnline } = storeToRefs(useApiStatusStore());

const cancelOpen = ref(false);
const cancelRequested = ref(false);

const cancel = () =>
  fetch(`/admin/crawl/${props.job.id}/cancel`, { method: "POST" })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || CRAWLER_CANCEL_ERROR_MESSAGE);
      }
      showSuccessToast(toast, `Crawler cancel requested: ${props.job.sourceName}`);
      cancelOpen.value = false;
      cancelRequested.value = true;
    })
    .catch(catchPromiseError(toast, CRAWLER_CANCEL_ERROR_MESSAGE));
</script>

<template>
  <UModal
    v-model:open="cancelOpen"
    title="Stop crawl?"
    :description="`This will stop the crawl for ${job.sourceName}. Books found so far will be saved.`"
  >
    <UIcon v-if="cancelRequested" name="i-lucide-loader-2" class="m-1.5 size-5 animate-spin" />
    <UButton
      v-else
      icon="i-lucide-ban"
      square
      color="error"
      variant="ghost"
      :disabled="!isOnline"
    />

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" label="Dismiss" @click="cancelOpen = false" />
        <UButton color="error" loading-auto label="Stop" :disabled="!isOnline" @click="cancel" />
      </div>
    </template>
  </UModal>
</template>
