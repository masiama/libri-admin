<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";

import { useSourcesStore } from "@/stores/sources";
import { createObjectUrl } from "@/utils";
import { getBookImageUrl } from "@/utils/book";
import { BarcodeSchema, BookSchema, type Book } from "@/utils/types";

const book = defineModel<Book>("book", { required: true });
const bookImage = defineModel<File>("bookImage");

defineProps<{ formId: string; isbnDisabled?: boolean; imageRequired?: boolean }>();
defineEmits<{ (e: "submit", event: FormSubmitEvent<Book>): void }>();

const { sourceOptions } = storeToRefs(useSourcesStore());

const imageLoadFailed = ref(false);

const bookImageUrl = computed(() => {
  if (bookImage.value) {
    return createObjectUrl(bookImage.value);
  }

  if (imageLoadFailed.value || !book.value.isbn) {
    return undefined;
  }

  return getBookImageUrl(book.value);
});

watch(
  () => [book.value.isbn, bookImage.value],
  () => (imageLoadFailed.value = false),
);
</script>

<template>
  <UForm
    :id="formId"
    :schema="BookSchema"
    :state="book"
    class="space-y-4"
    @submit="$emit('submit', $event)"
  >
    <UFormField label="Cover" :required="imageRequired">
      <UFileUpload
        v-slot="{ open }"
        v-model="bookImage"
        accept="image/jpeg"
        label="Drop cover image here"
        icon="i-lucide-image"
        class="h-50"
      >
        <UCard v-if="bookImageUrl" :ui="{ body: 'sm:p-2 p-2 h-full' }" class="h-full">
          <img
            :src="bookImageUrl"
            alt="Book Cover"
            class="h-full w-full cursor-pointer object-contain"
            @click="open()"
            @error="imageLoadFailed = true"
          />
        </UCard>
      </UFileUpload>
    </UFormField>

    <UFormField label="ISBN" name="isbn" required>
      <UInput v-model="book.isbn" :disabled="isbnDisabled" class="w-full" />
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

    <UFormField label="Source" name="sourceName" required>
      <USelect v-model="book.sourceName" :items="sourceOptions" class="w-full" />
    </UFormField>

    <UFormField label="Barcodes" name="barcodes" required>
      <div class="mb-4 flex flex-col gap-y-2" v-if="book.barcodes.length">
        <UForm
          v-for="(barcode, index) in book.barcodes"
          :key="index"
          :name="`barcodes.${index}`"
          :schema="BarcodeSchema"
          nested
        >
          <template #default="{ errors }">
            <UFormField
              required
              :error="errors.length ? errors.map((e) => e.message).join(', ') : false"
              :ui="{ error: 'm-1' }"
            >
              <UFieldGroup>
                <UInput v-model="barcode.type" placeholder="Type" />
                <UInput v-model="barcode.value" placeholder="Value" />
                <UButton
                  color="neutral"
                  variant="subtle"
                  icon="i-lucide-trash"
                  @click="book.barcodes = book.barcodes.filter((_, i) => i !== index)"
                />
              </UFieldGroup>
            </UFormField>
          </template>
        </UForm>
      </div>
      <UButton
        color="primary"
        variant="outline"
        @click="book.barcodes.push({ type: '', value: '' })"
        label="Add Barcode"
        icon="i-lucide-plus"
      />
    </UFormField>
  </UForm>
</template>
