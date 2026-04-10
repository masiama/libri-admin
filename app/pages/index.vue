<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const session = useSupabaseSession();
const config = useRuntimeConfig();

const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.log(error);
};

const startCrawlers = async () => {
  if (!session.value) {
    alert("You must be logged in to start crawlers");
    return;
  }

  try {
    const response = await fetch(`${config.public.apiBase}/api/v1/admin/crawl`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.value.access_token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to start crawlers");
    }
    alert("Crawlers started successfully!");
  } catch (error) {
    console.error(error);
    alert("Error starting crawlers");
  }
};
</script>

<template>
  <template v-if="user">
    <div>Logged in as {{ user.email }}</div>
    <button @click="logout">Logout</button>
    <button @click="startCrawlers">Start Crawlers</button>
  </template>
  <template v-else>
    <div>Not logged in</div>
    <a href="/login">Log in</a>
  </template>
</template>
