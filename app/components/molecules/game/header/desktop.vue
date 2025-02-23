<template>
  <div class="flex w-full items-center justify-between">
    <div class="flex items-center gap-3 transition">
      <AtomsButton>Grafo</AtomsButton>
      <AtomsButton
        v-if="!characterStore.currentPlayer?.informed"
        @click="emits('getBoardInfo')"
        >Liberar visão</AtomsButton
      >
      <AtomsPixelatedBox class="border-sk-color-warning text-sk-color-warning"
        >{{ stopWatchTime }} Restantes</AtomsPixelatedBox
      >
    </div>
    <div class="flex items-center gap-1">
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
  </div>
</template>

<script setup lang="ts">
import IconBreadthFirstSearch from '@/public/assets/icons/icon-breadth-first-search.svg'
import IconDepthFirstSearch from '@/public/assets/icons/icon-depth-first-search.svg'
import IconGreedySearch from '@/public/assets/icons/icon-greedy-search.svg'
import IconAStarSearch from '@/public/assets/icons/icon-a-star-search.svg'

const characterStore = useCharacterStore()

defineProps<{
  stopWatchTime: string
}>()

const emits = defineEmits([
  'getBoardInfo',
  'breadthFirstSearch',
  'depthFirstSearch',
  'greedySearch',
  'aStarSearch',
])
</script>
