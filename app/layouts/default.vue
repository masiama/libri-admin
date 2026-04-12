<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const links: NavigationMenuItem[] = [{ label: "Home", icon: "i-lucide-house", to: "/" }];
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

    <slot />
  </UDashboardGroup>
</template>
