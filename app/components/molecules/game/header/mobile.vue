<template>
  <div
    class="absolute left-0 top-0 z-20 h-full w-full bg-black/40"
    @click="hideSideMenu"
  >
    <div
      class="flex h-full w-[300px] flex-col justify-between gap-3 bg-black/80 p-4"
      @click.stop
    >
      <div class="flex flex-col gap-3">
        <div class="font-sk-font-pixel border-b pb-2 text-[18px] text-white">
          Configurações
        </div>
        <AtomsButton
          v-if="!characterStore.currentPlayer?.informed"
          @click="emits('getBoardInfo')"
          class="w-full"
          >Liberar visão</AtomsButton
        >
        <AtomsButton @click="emits('showGraph')">Mostrar grafo</AtomsButton>
      </div>

      <div class="flex flex-col gap-3">
        <div class="font-sk-font-pixel border-b pb-2 text-[18px] text-white">
          Modo
        </div>
        <div class="grid grid-cols-2 gap-3">
          <AtomsButton @click="emits('breadthFirstSearch')"
            ><IconBreadthFirstSearch class="h-5 w-9"
          /></AtomsButton>
          <AtomsButton @click="emits('depthFirstSearch')"
            ><IconDepthFirstSearch class="h-5 w-9"
          /></AtomsButton>
          <AtomsButton @click="emits('greedySearch')"
            ><IconGreedySearch class="h-5 w-9"
          /></AtomsButton>
          <AtomsButton @click="emits('aStarSearch')"
            ><IconAStarSearch class="h-5 w-9"
          /></AtomsButton>
        </div>
        <AtomsPixelatedBox class="border-sk-color-warning text-sk-color-warning"
          >{{ stopWatchTime }} Restantes</AtomsPixelatedBox
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconBreadthFirstSearch from '@/public/assets/icons/icon-breadth-first-search.svg'
import IconDepthFirstSearch from '@/public/assets/icons/icon-depth-first-search.svg'
import IconGreedySearch from '@/public/assets/icons/icon-greedy-search.svg'
import IconAStarSearch from '@/public/assets/icons/icon-a-star-search.svg'

const characterStore = useCharacterStore()
const { hideSideMenu } = useInterfaceStore()

defineProps<{
  stopWatchTime: string
}>()

const emits = defineEmits([
  'getBoardInfo',
  'breadthFirstSearch',
  'depthFirstSearch',
  'greedySearch',
  'aStarSearch',
  'showGraph',
])
</script>
