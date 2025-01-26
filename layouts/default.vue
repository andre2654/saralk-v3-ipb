<template>
  <main
    class="flex h-full min-h-screen w-full flex-col items-center justify-around gap-3 overflow-hidden bg-sk-color-bg px-4"
  >
    <AtomsLogo />
    <div
      :class="[
        route.path === '/'
          ? 'max-w-[400px]'
          : 'md:max-w-[700px] xl:max-w-[1200px]',
      ]"
      class="flex w-full max-w-[800px] flex-col gap-4"
    >
      <div class="flex w-full flex-col items-center justify-center gap-4">
        <slot />
      </div>
      <AtomsLink
        v-if="route.path !== '/'"
        @click="$router.go(-1)"
        class="ml-auto cursor-pointer"
        >{{ $t('general.return') }}</AtomsLink
      >
    </div>
    <AtomsCreateByLine />
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
</script>
