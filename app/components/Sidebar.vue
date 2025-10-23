<template>
  <UNavigationMenu orientation="vertical" :items="items" class="data-[orientation=vertical]:w-45" />
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Navigation',
      type: 'label'
    },
    {
      label: 'Upload',
      icon: 'lucide:upload',
      to: '/'
    },
    {
      label: 'Files',
      icon: 'lucide:file',
      to: 'files'
    }
  ]
])
</script>