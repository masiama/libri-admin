<script setup lang="ts">
import { useFetch } from "@/composables/useFetch";

const toast = useToast();
const { execute } = useFetch()("/admin/crawl", { immediate: false }).post();

const startCrawlers = () =>
  execute(true)
    .then(() => {
      toast.add({ title: "Success", description: "Crawlers started successfully!" });
    })
    .catch((error) => {
      console.error(error);
      toast.add({ title: "Error", description: "An error occurred while starting the crawlers." });
    });
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
