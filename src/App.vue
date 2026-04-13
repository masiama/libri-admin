<script setup lang="ts">
import { useAuth } from "@clerk/vue";
import type { NavigationMenuItem } from "@nuxt/ui";

import UserButton from "./components/UserButton.vue";

const { isLoaded, isSignedIn } = useAuth();

const links: NavigationMenuItem[] = [
  { label: "Home", icon: "i-lucide-house", to: "/" },
  { label: "Books", icon: "i-lucide-book", to: "/books" },
];
</script>

<template>
  <UApp :toaster="{ progress: false }">
    <UDashboardGroup unit="rem">
      <UDashboardSidebar
        id="default"
        collapsible
        resizable
        class="bg-elevated/25"
        :ui="{ footer: 'lg:border-t lg:border-default' }"
        :min-size="12"
      >
        <template #header="{ collapsed }">
          <UButton
            to="/"
            :label="collapsed ? undefined : 'Libri Admin'"
            color="neutral"
            variant="ghost"
            icon="i-lucide-book"
            :square="collapsed"
            block
            :ui="{ base: 'justify-start' }"
          />
        </template>

        <template #default="{ collapsed }">
          <UNavigationMenu
            :collapsed="collapsed"
            :items="links"
            orientation="vertical"
            tooltip
            popover
          />
        </template>

        <template #footer="{ collapsed }">
          <UserButton :collapsed="collapsed" />
        </template>
      </UDashboardSidebar>

      <div v-if="!isLoaded" />
      <RouterView v-else-if="isSignedIn" />
      <UDashboardPanel v-else :ui="{ body: 'justify-center' }">
        <template #body>
          <UPageSection
            title="Welcome to Libri Admin"
            description="Please sign in to access the dashboard."
          />
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
