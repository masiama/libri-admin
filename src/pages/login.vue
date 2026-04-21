<script setup lang="ts">
import { SignInButton } from "@clerk/vue";
import { useRoute } from "vue-router";

import AppLayout from "@/components/AppLayout.vue";

const route = useRoute();
const redirectPath = (route.query.redirect as string) || "/";
</script>

<template>
  <AppLayout>
    <UPageHero
      title="Libri Admin"
      description="Sign in to manage books, monitor active crawlers, and review status."
    >
      <template #links>
        <SignInButton mode="modal" :fallback-redirect-url="redirectPath">
          <UButton label="Sign In to Dashboard" size="xl" />
        </SignInButton>
      </template>
    </UPageHero>
  </AppLayout>
</template>
