<template>
  <Component
    v-bind:is="is"
    class="sk-border-pixelated flex items-center justify-center border-4 border-sk-color-border bg-sk-color-bg fill-sk-color-border p-3 text-center font-sk-font-pixel text-sk-color-border"
  >
    <slot />
  </Component>
</template>

<script setup>
defineProps({
  is: {
    type: String,
    default: 'div',
  },
})
</script>
