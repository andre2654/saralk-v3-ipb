<template>
  <div
    class="flex w-[200px] flex-col gap-1 overflow-hidden rounded-md bg-black/70 px-3 py-2 text-xs"
  >
    <b class="text-white">
      <span class="uppercase">{{ playerName }}</span> - Calculos:
    </b>

    <!-- Direção anterior -->
    <div v-if="previousDirection" class="text-yellow-500">
      Anterior: {{ getDirectionSymbol(previousDirection) }}
    </div>

    <!-- Opções de cálculo (apenas para GS e A*) -->
    <div
      v-if="isGreedyOrAStar && hasAdjacentBlocks"
      class="flex flex-col gap-2 text-yellow-500"
    >
      <div class="flex flex-col">
        Opções ({{ playerName === 'gs' ? 'custo' : 'heurística' }}):
        <span
          v-for="(option, direction) in calculationOptions"
          :key="direction"
        >
          {{ getDirectionName(direction) }}: {{ option }}
        </span>
      </div>
    </div>

    <hr v-if="previousDirection" class="-mx-3 opacity-30" />

    <!-- Decisão final -->
    <b class="text-green-500">
      {{ getDecisionLabel() }}: {{ getDirectionSymbol(chosenDirection) }}
      <span v-if="finalValue"> ({{ finalValue }})</span>
    </b>
  </div>
</template>

<script setup lang="ts">
import { ActionMoveEnum } from '@/enums/game'
import type { IBlockActive } from '@/types/game'

const props = defineProps({
  playerName: {
    type: String,
    required: true,
  },
  blockActive: {
    type: Array as PropType<IBlockActive[]>,
    required: true,
  },
})

// Computed properties para simplificar a lógica
const previousDirection = computed(
  () => props.blockActive?.[0]?.directionToGoHere
)
const chosenDirection = computed(
  () => props.blockActive?.[1]?.directionToGoHere
)
const currentBlock = computed(() => props.blockActive?.[1]?.currentBlock)
const adjacentBlocks = computed(() => props.blockActive?.[1]?.adjacentBlocks)

const isGreedyOrAStar = computed(() => ['gs', 'a*'].includes(props.playerName))
const hasAdjacentBlocks = computed(() => adjacentBlocks.value?.top?.heuristic)

// Função para converter direção em símbolo
const getDirectionSymbol = (direction: ActionMoveEnum): string => {
  const symbols: Record<ActionMoveEnum, string> = {
    [ActionMoveEnum.TOP]: '↑',
    [ActionMoveEnum.DOWN]: '↓',
    [ActionMoveEnum.LEFT]: '←',
    [ActionMoveEnum.RIGHT]: '→',
    [ActionMoveEnum.GET_BOARD_INFO]: '?',
    [ActionMoveEnum.HEARTBEAT]: '?',
    [ActionMoveEnum.MOVEMENT_NOT_FOUND]: '?',
  }
  return symbols[direction] || '?'
}

// Função para converter direção em nome
const getDirectionName = (direction: string): string => {
  const names = {
    top: 'Cima',
    down: 'Baixo',
    left: 'Esquerda',
    right: 'Direita',
  }
  return names[direction as keyof typeof names] || direction
}

// Opções de cálculo baseadas no tipo de algoritmo
const calculationOptions = computed(() => {
  if (!adjacentBlocks.value) return {}

  const options: Record<string, number> = {}
  const directions = ['top', 'down', 'left', 'right']

  directions.forEach((dir) => {
    const block = adjacentBlocks.value[dir as keyof typeof adjacentBlocks.value]
    if (block?.heuristic) {
      if (props.playerName === 'gs') {
        options[dir] = block.heuristic.cost
      } else if (props.playerName === 'a*') {
        options[dir] = block.heuristic.distanceAtGoal + block.heuristic.cost
      }
    }
  })

  return options
})

// Label da decisão baseado no algoritmo
const getDecisionLabel = (): string => {
  const labels = {
    gs: 'Menor custo',
    'a*': 'Melhor heurística',
    bfs: 'Escolhido',
    dfs: 'Escolhido',
  }
  return labels[props.playerName as keyof typeof labels] || 'Escolhido'
}

// Valor final para exibir
const finalValue = computed(() => {
  if (!currentBlock.value?.heuristic) return null

  if (props.playerName === 'gs') {
    return currentBlock.value.heuristic.distanceAtGoal
  } else if (props.playerName === 'a*') {
    return (
      currentBlock.value.heuristic.distanceAtGoal +
      currentBlock.value.heuristic.cost
    )
  }

  return null
})
</script>
