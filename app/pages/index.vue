<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.log(error)
}
</script>

<template>
  <template v-if="user">
    <div>Logged in as {{ user.email }}</div>
    <button @click="logout">Logout</button>
  </template>
  <template v-else>
    <div>Not logged in</div>
    <a href="/login">Log in</a>
  </template>
</template>
