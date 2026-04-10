<script setup lang="ts">
const supabase = useSupabaseClient();
const email = ref("");
const { origin } = useRequestURL();

const signInWithOtp = async () => {
  console.log(process.env.BASE_URL);
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: `${origin}/confirm`,
    },
  });
  if (error) console.log(error);
};
</script>
<template>
  <div>
    <button @click="signInWithOtp">Sign In with E-Mail</button>
    <input v-model="email" type="email" />
  </div>
</template>
