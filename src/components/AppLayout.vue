<script setup lang="ts">
import Footer from "@/components/Footer.vue";
import Header from "@/components/Header.vue";
</script>

<template>
  <div class="flex h-screen w-screen flex-col overflow-hidden">
    <Header>
      <template #controls>
        <slot name="header-controls" />
      </template>
    </Header>

    <main class="grow overflow-hidden">
      <slot />
    </main>

    <Footer>
      <template #controls>
        <slot name="footer-controls" />
      </template>
    </Footer>
  </div>
</template>
