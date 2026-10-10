<script setup lang="ts">
import { SignInButton, useAuth, UserButton } from "@clerk/vue";
import type { NavigationMenuItem } from "@nuxt/ui";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useRoute } from "vue-router";

import Logo from "@/assets/logo.svg?component";
import { useApiStatusStore } from "@/stores/apiStatus";

const { isSignedIn } = useAuth();
const { status, crawlerStatus, crawlerVersion } = storeToRefs(useApiStatusStore());
const route = useRoute();

const statusColor = {
  online: "bg-success",
  offline: "bg-error",
  checking: "bg-warning",
} as const;

const items = computed<NavigationMenuItem[]>(() => [
  { label: "Books", to: "/", active: route.path === "/" },
  { label: "Crawler", to: "/crawler", active: route.path === "/crawler" },
  { label: "Purgatory", to: "/purgatory", active: route.path === "/purgatory" },
]);
</script>

<template>
  <header class="border-default h-(--ui-header-height) shrink-0 border-b">
    <div class="flex h-full w-full items-center gap-3 px-4">
      <div class="flex items-center gap-2" aria-label="Libri Admin">
        <Logo class="text-primary h-6 w-6" />
        <span class="text-lg font-semibold">Libri Admin</span>
        <UTooltip text="API">
          <span :class="statusColor[status]" class="inline-block h-2 w-2 rounded-full" />
        </UTooltip>
        <UTooltip :text="crawlerVersion ? `Crawler ${crawlerVersion}` : 'Crawler'">
          <span :class="statusColor[crawlerStatus]" class="inline-block h-2 w-2 rounded-full" />
        </UTooltip>
      </div>

      <UNavigationMenu :items="items" class="grow" />

      <div class="flex items-center gap-4">
        <slot name="controls" />

        <UserButton v-if="isSignedIn" />
        <SignInButton v-else mode="modal">
          <UAvatar icon="i-lucide-user" class="cursor-pointer" />
        </SignInButton>

        <UColorModeButton />
      </div>
    </div>
  </header>
</template>
