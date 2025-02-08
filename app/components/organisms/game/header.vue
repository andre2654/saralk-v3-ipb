<template>
  <div>
    <MoleculesGameHeaderDesktop
      class="max-xl:hidden"
      :stop-watch-time="stopWatchTime"
      @get-board-info="emits('getBoardInfo')"
      @breadth-first-search="emits('breadthFirstSearch')"
      @depth-first-search="emits('depthFirstSearch')"
      @greedy-search="emits('greedySearch')"
      @a-star-search="emits('aStarSearch')"
    />
    <AtomsButton class="xl:hidden" @click="interfaceStore.showSideMenu">
      <IconMenu class="h-5 w-auto" />
    </AtomsButton>
    <MoleculesGameHeaderMobile
      v-if="interfaceStore.sideMenuOpened"
      class="xl:hidden"
      :stop-watch-time="stopWatchTime"
      @get-board-info="emits('getBoardInfo')"
      @breadth-first-search="emits('breadthFirstSearch')"
      @depth-first-search="emits('depthFirstSearch')"
      @greedy-search="emits('greedySearch')"
      @a-star-search="emits('aStarSearch')"
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

const emits = defineEmits([
  'getBoardInfo',
  'breadthFirstSearch',
  'depthFirstSearch',
  'greedySearch',
  'aStarSearch',
])
</script>
