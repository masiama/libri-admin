<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const { isSignedIn } = useAuth();

const links: NavigationMenuItem[] = [
  { label: "Home", icon: "i-lucide-house", to: "/" },
  { label: "Books", icon: "i-lucide-book", to: "/books" },
];
</script>

<template>
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

    <slot v-if="isSignedIn" />
    <UDashboardPanel v-else :ui="{ body: 'justify-center' }">
      <template #body>
        <UPageSection
          title="Welcome to Libri Admin"
          description="Please sign in to access the dashboard."
        />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
