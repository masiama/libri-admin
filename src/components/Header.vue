<script setup lang="ts">
import { SignInButton, useAuth, UserButton } from "@clerk/vue";
import { useTemplateRef } from "vue";

import Logo from "@/assets/logo.svg?component";
import BookUpsertSlideover from "@/components/BookUpsertSlideover.vue";
import { useApiStatus } from "@/composables/useApiStatus";
import { useAuthedFetch } from "@/composables/useFetch";
import { store } from "@/store";
import { showErrorToast, showSuccessToast } from "@/utils";

const CRAWL_START_ERROR_MESSAGE = "An error occurred while starting the crawlers.";

defineProps<{ sourceOptions: string[] }>();
const emit = defineEmits<{ (e: "refetchBooks"): Promise<void> }>();

const toast = useToast();
const fetch = useAuthedFetch();
const { isSignedIn } = useAuth();
const filterRef = useTemplateRef("filter");
const status = useApiStatus(() => emit("refetchBooks"));

defineShortcuts({ "/": () => filterRef.value?.inputRef?.focus() });

const startCrawlers = () =>
  fetch("/admin/crawl", { method: "POST" })
    .then(async (response) => {
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || CRAWL_START_ERROR_MESSAGE);
      }

      showSuccessToast(toast, "Crawlers started successfully!");
    })
    .catch((error) => {
      console.error(error);
      showErrorToast(toast, error instanceof Error ? error.message : CRAWL_START_ERROR_MESSAGE);
    });
</script>

<template>
  <header class="border-default h-(--ui-header-height) shrink-0 border-b">
    <div class="flex h-full w-full items-center justify-between gap-3 px-4">
      <div class="flex items-center gap-2" aria-label="Libri Admin">
        <Logo class="text-primary h-6 w-6" />
        <span class="text-lg font-semibold">Libri Admin</span>
        <span
          :class="{
            'bg-success': status === 'online',
            'bg-error': status === 'offline',
            'bg-warning': status === 'checking',
          }"
          class="inline-block h-2 w-2 rounded-full"
        />
      </div>
      <div class="flex items-center gap-4">
        <BookUpsertSlideover :source-options="sourceOptions" @saved="$emit('refetchBooks')">
          <template #default="{ onClick }">
            <UButton icon="i-lucide-plus" class="rounded-full" @click="onClick" />
          </template>
        </BookUpsertSlideover>
        <UButton
          icon="i-lucide-refresh-ccw"
          class="rounded-full"
          @click="startCrawlers"
          :disabled="!store.isOnline"
        />

        <UInput
          ref="filter"
          v-model="store.search"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Filter books..."
          :disabled="!store.isOnline"
        >
          <template #trailing>
            <UKbd value="/" />
          </template>
        </UInput>

        <UserButton v-if="isSignedIn" />
        <SignInButton v-else mode="modal">
          <UAvatar icon="i-lucide-user" class="cursor-pointer" />
        </SignInButton>
      </div>
    </div>
  </header>
</template>
