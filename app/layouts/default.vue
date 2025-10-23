<template>
  <div class="flex min-h-screen">
    <div class="w-50 shrink-0 p-2 border-r border-gray-700">
      <Sidebar/>
    </div>
    <div class="flex-1 min-w-0">
      <slot />
    </div>
  </div>
</template>