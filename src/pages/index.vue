<script setup lang="ts">
import { useAuth } from "@clerk/vue";

const { isSignedIn, getToken } = useAuth();
const toast = useToast();

const startCrawlers = async () => {
  const token = await getToken.value({ template: import.meta.env.VITE_CLERK_TOKEN_TEMPLATE });
  if (!token) {
    toast.add({
      title: "Authentication Error",
      description: "You must be signed in to start the crawlers.",
    });
    return;
  }
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/v1/admin/crawl`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Failed to start crawlers");
    }
    toast.add({
      title: "Success",
      description: "Crawlers started successfully!",
    });
  } catch (error) {
    console.error(error);
    toast.add({
      title: "Error",
      description: "An error occurred while starting the crawlers.",
    });
  }
};
</script>

<template>
  <UDashboardPanel id="home">
    <template #body>
      <div>
        <UButton @click="startCrawlers" label="Start Crawlers" leading-icon="i-lucide-play" />
      </div>
    </template>
  </UDashboardPanel>
</template>
