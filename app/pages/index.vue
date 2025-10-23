<template>
  <div class="flex justify-center items-center min-h-screen">
    <UCard>
      <template #header>
        <h1>Download CSV file</h1>
      </template>
      <UForm
        class="flex flex-col gap-4"
        @submit="sendFile"
      >
        <div 
          class="w-96 min-h-48 cursor-pointer border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-3 transition-colors hover:border-gray-400"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @click="handleClick"
        >
          <UIcon name="i-lucide-file" class="w-8 h-8 text-gray-400" />
          <span v-if="!file" class="text-gray-600">Drop your csv file here</span>
          <span v-else class="text-center" >{{ file?.name }}</span>
          <input 
            ref="fileInput"
            type="file" 
            class="hidden" 
            :accept="acceptedFileTypes"
            @change="handleFileSelect"
          />
        </div>
        <UInput 
          v-model="fileName"
          :disabled="!file"
          placeholder="File name"
        />
        <UButton 
          :label="loading? '' : 'Send file'"
          :disabled="!file"
          type="submit"
          :loading
          class="flex justify-center items-center cursor-pointer"
          size="xl"
        />
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()
const fileName = ref('')

watch(file, () => {
  if(file.value && file.value?.name){
    fileName.value = file.value.name
  } else {
    fileName.value = ''
  }
})

const acceptedFileTypes = '.csv'

const loading = ref(false)

const handleClick = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) {
    return
  }

  const files = Array.from(target.files)
  validateAndSetFiles(files)
  target.value = ''
}

// Обработчик перетаскивания
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (!event.dataTransfer || !event.dataTransfer.files) {
    return
  }

  const files = Array.from(event.dataTransfer.files)
  validateAndSetFiles(files)
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const validateAndSetFiles = (files: File[]) => {
  
  if (files.length === 0 || !files[0]) {
    return
  }

  const fileName = files[0].name.toLowerCase()
  
  if (!fileName.endsWith('.csv')) {
    toast.add({
      title:'Разрешены только CSV файлы',
      color:'error'
    })
    return
  }

  file.value = files[0]
}

const sendFile = async () => {
  loading.value = true
  try {
    const formData = new FormData()
    if(file.value) {
      formData.append('file', file.value)
      formData.append('fileName', fileName.value)
    }
    
    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    toast.add({
      title: 'Файл успешно загружен!',
      color: 'success'
    })
    file.value = null
    
  } catch (error: any) {
    console.log('Ошибка:', error)
    
    if (error?.data?.message) {
      toast.add({
        title: error.data.message,
        color: 'error'
      })
    } else if (error?.statusCode === 400) {
      toast.add({
        title: 'Неправильный запрос. Проверьте файл и попробуйте снова.',
        color: 'error'
      })
    } else if (error?.statusCode === 409) {
      toast.add({
        title: 'Файл с таким именем уже существует',
        color: 'error'
      })
    } else {
      toast.add({
        title: 'Произошла ошибка при загрузке файла',
        color: 'error'
      })
    }
  } finally {
    loading.value = false
  }
}
</script>