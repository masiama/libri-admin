<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";

const supabase = useSupabaseClient();
const { origin } = useRequestURL();
const toast = useToast();

const loading = ref(false);
const invalid = ref(false);

const onSubmit = async (payload: FormSubmitEvent<{ email: string }>) => {
  invalid.value = false;
  loading.value = true;

  const { error } = await supabase.auth.signInWithOtp({
    email: payload.data.email,
    options: { emailRedirectTo: `${origin}/confirm` },
  });

  loading.value = false;

  if (error) {
    invalid.value = true;
    console.log(error);
  } else {
    toast.add({
      title: "Check your email",
      description: "We've sent you a magic link to sign in. Please check your inbox.",
      progress: false,
    });
  }
};

const fields: AuthFormField[] = [
  { name: "email", type: "email", label: "Email", placeholder: "Enter your email", required: true },
];
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md" variant="subtle">
      <UAuthForm
        :fields="fields"
        title="Welcome back!"
        icon="i-lucide-lock"
        @submit="onSubmit"
        :loading="loading"
      >
        <template #validation v-if="invalid">
          <UAlert color="error" icon="i-lucide-info" title="Error signing in" />
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
