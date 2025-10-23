<template>
  <UCard 
    class="w-full max-w-80 h-60 hover:shadow-lg transition-shadow duration-200 flex flex-col"
  >
    <template #header>
      <div class="flex justify-between items-start gap-2">
        <h3 class="text-lg font-semibold text-highlighted truncate flex-1">{{ name }}</h3>
        <span class="text-sm text-muted bg-elevated px-2 py-1 rounded-md whitespace-nowrap shrink-0">
          {{ size }}
        </span>
      </div>
    </template>

    <div class="flex items-center gap-4 flex-1 min-h-0">
      <UIcon name="i-lucide-file" class="size-12 text-primary shrink-0" />
      <div class="flex flex-col min-w-0 flex-1">
        <p class="text-sm text-muted truncate">
          {{ formatDate(createAt) }}
        </p>
      </div>
    </div>
    
    <template #footer>
      <div class="flex gap-2 justify-between items-center">
        <UButton
          class="cursor-pointer shrink-0"
          :icon="loading? '' : 'lucide:trash'"
          :loading="loading"
          color="error"
          variant="soft"
          @click="deleteFile"
        />
        <UButton
          class="cursor-pointer shrink-0"
          icon="hugeicons:view"
          color="neutral"
          variant="soft"
          :to="`table?id=${id}&page=1`"
        />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
type Props = {
  id: number
  name: string
  size: string
  createAt: Date | string,
  refresh: () => Promise<void>
}
const props = defineProps<Props>()

const toast = useToast()

const loading = ref(false)
const deleteFile = async () => {
  loading.value = true
  try {
    await $fetch('/api/delete-file',{
      method: 'DELETE',
      params: {
        id: props.id
      }
    })    
    await props.refresh()

    toast.add({
      title: 'The file has been deleted successfully.',
      color: 'success'
    })
  } catch {
    toast.add({
      title: 'Error deleting file',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>