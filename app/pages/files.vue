<template>
  <div>
    <div v-if="pending" class="flex justify-center items-center min-h-screen">
      <Icon 
        name="line-md:loading-twotone-loop"
        size="70"
      />
    </div>
    <div v-if="error" class="flex justify-center items-center min-h-screen">
      <UBadge color="error" >An error occurred, please try again later.</UBadge>
    </div>
    <div v-if="!data?.data.length" class="flex flex-col gap-2 justify-center items-center min-h-screen">
      <UBadge variant="soft" color="warning">You have not uploaded any files.</UBadge>
      <UButton 
        icon="lucide:download"
        variant="ghost"
        to="/"
      />
    </div>
    <div v-if="data?.data" class="p-4 flex flex-wrap gap-4">
      <File 
        v-for="file in data.data"
        :id="file.id"
        :name="file.fileName"
        :size="file.fileSizeFormatted || '-'"
        :create-at="file.createdAt"
        :refresh="refresh"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, error, pending, refresh } = useFetch('/api/get-files')
</script>