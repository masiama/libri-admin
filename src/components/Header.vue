<script setup lang="ts">
import { SignInButton, useAuth, UserButton } from "@clerk/vue";
import type { NavigationMenuItem } from "@nuxt/ui";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useRoute } from "vue-router";

import Logo from "@/assets/logo.svg?component";
import { useApiStatusStore } from "@/stores/apiStatus";

const { isSignedIn } = useAuth();
const { status } = storeToRefs(useApiStatusStore());
const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  { label: "Books", to: "/", active: route.path === "/" },
  { label: "Crawler", to: "/crawler", active: route.path === "/crawler" },
]);
</script>

<template>
  <header class="border-default h-(--ui-header-height) shrink-0 border-b">
    <div class="flex h-full w-full items-center gap-3 px-4">
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
