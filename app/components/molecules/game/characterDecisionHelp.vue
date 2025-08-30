<template>
  <div
    class="flex min-w-max max-w-max flex-col gap-1 overflow-hidden rounded-md bg-black/70 px-3 py-2 text-xs"
  >
    <b class="text-white"
      ><span class="uppercase">{{ playerName }}</span> - Calculos:</b
    >
    <!-- Mesmo para DFS e BFS -->
    <div class="flex flex-col gap-1" v-if="['bfs', 'dfs'].includes(playerName)">
      <div class="text-yellow-500">
        Anterior:
        <span v-if="blockActive[0].directionToGoHere === ActionMoveEnum.TOP"
          >↑</span
        >
        <span v-if="blockActive?.[0]?.directionToGoHere === ActionMoveEnum.DOWN"
          >↓</span
        >
        <span v-if="blockActive?.[0]?.directionToGoHere === ActionMoveEnum.LEFT"
          >←</span
        >
        <span
          v-if="blockActive?.[0]?.directionToGoHere === ActionMoveEnum.RIGHT"
          >→</span
        >
      </div>
      <hr class="-mx-3 opacity-30" />
      <b class="text-green-500">
        Escolhido:
        <span v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.TOP"
          >↑</span
        >
        <span v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.DOWN"
          >↓</span
        >
        <span v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.LEFT"
          >←</span
        >
        <span
          v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.RIGHT"
          >→</span
        >
      </b>
    </div>

    <!-- Greedy -->
    <div class="flex flex-col gap-1" v-else-if="playerName === 'gs'">
      <div class="flex flex-col gap-2 text-yellow-500">
        <div v-if="blockActive?.[0]">
          Anterior:
          <span v-if="blockActive[0].directionToGoHere === ActionMoveEnum.TOP"
            >↑</span
          >
          <span v-if="blockActive[0].directionToGoHere === ActionMoveEnum.DOWN"
            >↓</span
          >
          <span v-if="blockActive[0].directionToGoHere === ActionMoveEnum.LEFT"
            >←</span
          >
          <span v-if="blockActive[0].directionToGoHere === ActionMoveEnum.RIGHT"
            >→</span
          >
        </div>
        <div
          class="flex flex-col"
          v-if="blockActive?.[0].adjacentBlocks.top?.heuristic"
        >
          Opcões (custo):
          <span>
            Cima:
            {{ blockActive[0].adjacentBlocks.top.heuristic.cost }}
          </span>
          <span v-if="blockActive[0].adjacentBlocks.down?.heuristic">
            Baixo:
            {{ blockActive[0].adjacentBlocks.down.heuristic.cost }}
          </span>
          <span v-if="blockActive[0].adjacentBlocks.left?.heuristic">
            Esquerda:
            {{ blockActive[0].adjacentBlocks.left.heuristic.cost }}
          </span>
          <span v-if="blockActive[0].adjacentBlocks.right?.heuristic">
            Direita:
            {{ blockActive[0].adjacentBlocks.right.heuristic.cost }}
          </span>
        </div>
      </div>

      <hr class="-mx-3 opacity-30" />
      <b class="text-green-500">
        Menor custo:
        <span v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.TOP"
          >↑</span
        >
        <span v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.DOWN"
          >↓</span
        >
        <span v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.LEFT"
          >←</span
        >
        <span
          v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.RIGHT"
          >→</span
        >
      </b>
    </div>

    <!-- A* -->
    <div class="flex flex-col gap-1" v-else-if="playerName === 'a*'">
      <div class="flex flex-col gap-2 text-yellow-500">
        <div v-if="blockActive?.[0]">
          Anterior:
          <span v-if="blockActive[0].directionToGoHere === ActionMoveEnum.TOP"
            >↑</span
          >
          <span v-if="blockActive[0].directionToGoHere === ActionMoveEnum.DOWN"
            >↓</span
          >
          <span v-if="blockActive[0].directionToGoHere === ActionMoveEnum.LEFT"
            >←</span
          >
          <span v-if="blockActive[0].directionToGoHere === ActionMoveEnum.RIGHT"
            >→</span
          >
        </div>
        <div
          class="flex flex-col"
          v-if="blockActive?.[0].adjacentBlocks.top?.heuristic"
        >
          Opcões (heurística):
          <span>
            Cima:
            {{ blockActive[0].adjacentBlocks.top.heuristic.distanceAtGoal }}
          </span>
          <span v-if="blockActive[0].adjacentBlocks.down?.heuristic">
            Baixo:
            {{ blockActive[0].adjacentBlocks.down.heuristic.distanceAtGoal }}
          </span>
          <span v-if="blockActive[0].adjacentBlocks.left?.heuristic">
            Esquerda:
            {{ blockActive[0].adjacentBlocks.left.heuristic.distanceAtGoal }}
          </span>
          <span v-if="blockActive[0].adjacentBlocks.right?.heuristic">
            Direita:
            {{ blockActive[0].adjacentBlocks.right.heuristic.distanceAtGoal }}
          </span>
        </div>
      </div>

      <hr class="-mx-3 opacity-30" />
      <b class="text-green-500">
        Melhor heurística:
        <span v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.TOP"
          >↑</span
        >
        <span v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.DOWN"
          >↓</span
        >
        <span v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.LEFT"
          >←</span
        >
        <span
          v-if="blockActive?.[1]?.directionToGoHere === ActionMoveEnum.RIGHT"
          >→</span
        >
        (
        {{ blockActive?.[1]?.currentBlock?.heuristic.distanceAtGoal }}
        )
      </b>
    </div>
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
</script>
