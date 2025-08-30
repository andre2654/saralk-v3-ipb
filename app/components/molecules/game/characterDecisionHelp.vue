<template>
  <div
    class="flex w-[200px] flex-col gap-1 overflow-hidden rounded-md bg-black/70 px-3 py-2 text-xs"
  >
    <b class="text-white"
      ><span class="uppercase">{{ playerName }}</span> - Calculos:</b
    >
    <!-- Greedy -->
    <div class="flex flex-col gap-1" v-if="playerName === 'gs'">
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
          v-if="blockActive?.[1].adjacentBlocks.top?.heuristic"
        >
          Opcões (custo):
          <span>
            Cima:
            {{ blockActive[1].adjacentBlocks.top.heuristic.cost }}
          </span>
          <span v-if="blockActive[1].adjacentBlocks.down?.heuristic">
            Baixo:
            {{ blockActive[1].adjacentBlocks.down.heuristic.cost }}
          </span>
          <span v-if="blockActive[1].adjacentBlocks.left?.heuristic">
            Esquerda:
            {{ blockActive[1].adjacentBlocks.left.heuristic.cost }}
          </span>
          <span v-if="blockActive[1].adjacentBlocks.right?.heuristic">
            Direita:
            {{ blockActive[1].adjacentBlocks.right.heuristic.cost }}
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
        (
        {{ blockActive?.[1]?.currentBlock?.heuristic.distanceAtGoal }}
        )
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
          v-if="blockActive?.[1].adjacentBlocks.top?.heuristic"
        >
          Opcões (heurística):
          <span>
            Cima:
            {{
              blockActive[1].adjacentBlocks.top.heuristic.distanceAtGoal +
              blockActive[1].adjacentBlocks.top.heuristic.cost
            }}
          </span>
          <span v-if="blockActive[1].adjacentBlocks.down?.heuristic">
            Baixo:
            {{
              blockActive[1].adjacentBlocks.down.heuristic.distanceAtGoal +
              blockActive[1].adjacentBlocks.down.heuristic.cost
            }}
          </span>
          <span v-if="blockActive[1].adjacentBlocks.left?.heuristic">
            Esquerda:
            {{
              blockActive[1].adjacentBlocks.left.heuristic.distanceAtGoal +
              blockActive[1].adjacentBlocks.left.heuristic.cost
            }}
          </span>
          <span v-if="blockActive[1].adjacentBlocks.right?.heuristic">
            Direita:
            {{
              blockActive[1].adjacentBlocks.right.heuristic.distanceAtGoal +
              blockActive[1].adjacentBlocks.right.heuristic.cost
            }}
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
        {{
          blockActive?.[1]?.currentBlock?.heuristic.distanceAtGoal +
          blockActive?.[1]?.currentBlock?.heuristic.cost
        }}
        )
      </b>
    </div>

    <!-- Mesmo para DFS e BFS -->
    <div class="flex flex-col gap-1" v-else>
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
