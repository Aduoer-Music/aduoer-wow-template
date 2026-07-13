<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { withBase } from 'vitepress';
import { createApiReference } from '@scalar/api-reference';

const container = ref<HTMLElement>();

onMounted(() => {
  if (!container.value) return;
  createApiReference(container.value, {
    url: withBase('/openapi.json'),
    theme: 'purple',
    layout: 'modern',
    hideModels: false,
    defaultHttpClient: { targetKey: 'shell', clientKey: 'curl' }
  });
});
</script>

<template>
  <div ref="container" class="scalar-reference" />
</template>
