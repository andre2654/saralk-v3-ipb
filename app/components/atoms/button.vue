<template>
  <AtomsPixelatedBox
    v-if="!to"
    :type="type"
    is="button"
    class="hover:border-sk-color-primary hover:fill-sk-color-primary hover:text-sk-color-primary"
  >
    <slot />
  </AtomsPixelatedBox>
  <nuxt-link v-else :to="to">
    <AtomsPixelatedBox
      class="w-full hover:border-sk-color-primary hover:fill-sk-color-primary hover:text-sk-color-primary"
      is="button"
    >
      <slot />
    </AtomsPixelatedBox>
  </nuxt-link>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'button',
  },
  to: {
    type: String,
    default: '',
  },
})
</script>
