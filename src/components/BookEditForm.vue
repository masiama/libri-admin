<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

import { createObjectUrl, getBookImageUrl } from "@/utils";
import { BookSchema, type Book } from "@/utils/types";

const book = defineModel<Book>("book", { required: true });
const bookImage = defineModel<File>("bookImage");

defineProps<{ formId: string; sourceOptions: string[] }>();
defineEmits<{ (e: "submit", event: FormSubmitEvent<Book>): void }>();
</script>

<template>
  <UForm :id="formId" :schema="BookSchema" :state="book" class="space-y-4" @submit="onSubmit">
    <UFormField>
      <UFileUpload v-slot="{ open }" v-model="bookImage" accept="image/jpeg">
        <UCard class="flex h-50" :ui="{ body: 'sm:p-2 p-2' }">
          <img
            :src="bookImage ? createObjectUrl(bookImage) : getBookImageUrl(book)"
            alt="Book Cover"
            class="h-full w-full cursor-pointer object-contain"
            @click="open()"
          />
        </UCard>
      </UFileUpload>
    </UFormField>

    <UFormField label="ISBN" name="isbn">
      <UInput v-model="book.isbn" disabled class="w-full" />
    </UFormField>

    <UFormField label="Title" name="title" required>
      <UInput v-model="book.title" class="w-full" />
    </UFormField>

    <UFormField label="Authors" name="authors">
      <UInputTags v-model="book.authors" class="w-full" />
    </UFormField>

    <UFormField label="URL" name="url" required>
      <UInput v-model="book.url" class="w-full" />
    </UFormField>

    <UFormField label="Source" name="source" required>
      <USelect v-model="book.sourceName" :items="sourceOptions" class="w-full" />
    </UFormField>
  </UForm>
</template>
