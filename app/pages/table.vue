<template>
  <div class="w-full space-y-4 p-4">
    <UInput
      v-model="searchQuery"
      placeholder="Поиск..."
      icon="i-heroicons-magnifying-glass"
      class="max-w-sm"
    />
    
    <UTable
      :data="tableData"
      :loading="pending"
      :columns="columns"
      class="w-full border rounded border-gray-700"
    />
    <div class="flex justify-center">
      <UPagination
        v-model:page="currentPage"
        :items-per-page="itemsPerPage"
        :total="totalItems"
        active-variant="subtle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

type TableRow = {
  [key: string]: any
}

type ApiData = {
  success: boolean
  data: { id: number; rowData: any }[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const route = useRoute()
const router = useRouter()
const currentPage = ref(Number(route.query.page) || 1)
const searchQuery = ref('')

const fileId = computed(() => route.query.id || 1)

const queryParams = computed(() => ({
  page: currentPage.value,
  id: fileId.value,
  search: searchQuery.value
}))

const { data: apiData, pending } = useFetch<ApiData>('/api/get-lines',{
  params: queryParams
})

const tableData = computed(() => {
  if (apiData.value?.data) {
    return apiData.value.data.map(item => ({ ...item.rowData }))
  }
  return []
})

const totalItems = computed(() => apiData.value?.total || 0)
const totalPages = computed(() => apiData.value?.totalPages || 0)
const itemsPerPage = computed(() => apiData.value?.limit)

const columns = computed<TableColumn<TableRow>[]>(() => {
  if (tableData.value.length > 0) {
    const firstItem = tableData.value[0]
    return Object.keys(firstItem).map(key => ({
      accessorKey: key,
      header: key
    }))
  }
  return []
})

watch(currentPage, () => {
  router.replace({
    query: {
      ...route.query,
      page: currentPage.value.toString()
    }
  })
})
</script>