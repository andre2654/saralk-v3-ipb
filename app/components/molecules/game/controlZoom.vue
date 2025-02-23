<template>
  <div
    class="mr-2 flex w-[45px] flex-col gap-2 rounded-full bg-black/80 p-3 text-sm text-white"
  >
    <button @click="interfaceStore.increaseZoom">+</button>
    <div class="text-xs">{{ interfaceStore.zoom.toFixed(2) }}</div>
    <button @click="interfaceStore.decreaseZoom">-</button>
  </div>
</template>

<script setup lang="ts">
const interfaceStore = useInterfaceStore()
</script>
