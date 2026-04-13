<script setup lang="ts">
import { SignInButton, SignOutButton, useUser } from "@clerk/vue";

defineProps<{ collapsed?: boolean }>();

const { isLoaded, user } = useUser();
</script>

<template>
  <SignOutButton v-if="isLoaded && user">
    <UButton
      :avatar="{ src: user.imageUrl, alt: user.username ?? undefined }"
      :label="!collapsed && user.username ? user.username : undefined"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      :trailing-icon="collapsed ? undefined : 'i-lucide-log-out'"
      :ui="{ trailingIcon: 'text-dimmed size-4' }"
    />
  </SignOutButton>
  <div v-else-if="!isLoaded" class="flex w-full items-center gap-1.5 px-2.5 py-1.5">
    <USkeleton class="size-5 shrink-0 rounded-full" />
    <USkeleton class="h-3.5 max-w-25 grow" />
    <USkeleton class="ml-auto size-4 shrink-0 rounded-md" />
  </div>
  <SignInButton v-else mode="modal">
    <UButton
      label="Sign In"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      :trailing-icon="collapsed ? undefined : 'i-lucide-log-in'"
      :ui="{ trailingIcon: 'text-dimmed size-4' }"
    />
  </SignInButton>
</template>
