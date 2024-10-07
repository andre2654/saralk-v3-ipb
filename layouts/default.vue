<template>
  <main
    class="bg-sk-color-bg flex h-full min-h-screen w-full flex-col items-center justify-around gap-3 overflow-hidden px-4"
  >
    <AtomsLogo />
    <div
      :class="[
        route.path === '/'
          ? 'max-w-[400px]'
          : 'md:max-w-[700px] xl:max-w-[1200px]',
      ]"
      class="flex w-full max-w-[800px] flex-col items-center justify-center gap-4"
    >
      <slot />
      <AtomsLink v-if="route.path !== '/'" to="/" class="ml-auto">{{
        $t('general.return')
      }}</AtomsLink>
    </div>
    <AtomsCreateByLine />
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
