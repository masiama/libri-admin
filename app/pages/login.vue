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
  <UContainer class="flex h-screen items-center justify-center">
    <UForm class="flex flex-col space-y-4 rounded border border-white/20 bg-white/5 p-4">
      <UFormField label="Email" name="email">
        <UInput v-model="email" placeholder="Enter your email" />
      </UFormField>
      <UButton icon="i-lucide-user" variant="subtle" @click="signInWithOtp">
        Sign In with E-Mail
      </UButton>
    </UForm>
  </UContainer>
</template>
