<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref } from "vue";

import { type PaginatedResponse } from "@/composables/usePagination";
import { useApiStatusStore } from "@/stores/apiStatus";
import { type CrawlJob, type CrawlJobError } from "@/utils/types";

const props = defineProps<{ job: CrawlJob }>();

const { isOnline } = storeToRefs(useApiStatusStore());

const open = ref(false);
const tableRef = ref<{ page: number; data: PaginatedResponse<CrawlJobError> }>();
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'max-w-5xl', body: 'sm:p-0' }">
    <UButton
      color="error"
      variant="soft"
      size="xs"
      :label="`${job.errorCount}`"
      trailing-icon="i-lucide-triangle-alert"
    />

    <template #title>
      <div class="flex items-center gap-2">
        <UBadge
          color="error"
          variant="soft"
          size="sm"
          :label="`${job.errorCount}`"
          trailing-icon="i-lucide-triangle-alert"
        />
        <span>Errors — {{ job.sourceName }}</span>
      </div>
    </template>

    <template #body>
      <CrawlJobErrorsTable v-if="open" ref="tableRef" :job-id="job.id" />
    </template>

    <template #footer v-if="tableRef?.data && tableRef.data.page.totalPages > 1">
      <UPagination
        v-model:page="tableRef.page"
        :total="tableRef.data.page.totalElements"
        :items-per-page="tableRef.data.page.size"
        :disabled="!isOnline"
        class="ml-auto"
      />
    </template>
  </UModal>
</template>
