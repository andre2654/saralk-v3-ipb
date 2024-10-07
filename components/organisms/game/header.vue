<template>
  <div>
    <MoleculesGameHeaderDesktop
      class="max-xl:hidden"
      :stopWatchTime="stopWatchTime"
    />
    <AtomsButton class="xl:hidden" @click="interfaceStore.showSideMenu">
      <IconMenu class="h-5 w-auto" />
    </AtomsButton>
    <MoleculesGameHeaderMobile
      v-if="interfaceStore.sideMenuOpened"
      class="xl:hidden"
      :stopWatchTime="stopWatchTime"
    />
  </div>
</template>

<script setup lang="ts">
import IconMenu from '@/public/assets/icons/icon-menu.svg'
import { formatTimeFromSeconds } from '@/utils/helpers'
const utilitiesStore = useUtilitiesStore()
const interfaceStore = useInterfaceStore()

const stopWatchTime = computed(() => {
  return formatTimeFromSeconds(utilitiesStore.game.stopwatch.time)
})
</script>
