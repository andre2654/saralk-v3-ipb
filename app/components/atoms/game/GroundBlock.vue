<template>
  <div
    :class="[
      'h-sk-height-block w-sk-width-block relative flex cursor-pointer items-center justify-center overflow-hidden hover:opacity-40',
      !userIsInformed && !blockIsAdjacent ? 'border-none' : 'border-2',
      blockClass,
    ]"
  >
    <TransitionFade>
      <div
        v-if="!userIsInformed && !blockIsAdjacent"
        :class="{
          'opacity-80': blockIsAround,
        }"
        class="absolute left-0 top-0 z-[2] h-full w-full bg-black"
      />
    </TransitionFade>
    <div v-if="points" class="relative">
      <span
        class="font-sk-font-pixel absolute left-1/2 top-1/2 z-[1] ms-[2.5px] mt-[2px] -translate-x-1/2 -translate-y-1/2 text-sm text-[#FFEAB4]"
        >{{ points }}</span
      >
      <img
        class="image-pixelated pointer-events-none select-none"
        src="/assets/images/bonus-ring-object.png"
        width="45"
        alt="Bonus object"
      />
    </div>
    <div
      v-if="userIsInformed && !blocked && !blockIsGoal"
      class="absolute top-0 z-[1] flex w-full justify-between p-1 text-xs"
    >
      <span> C:{{ heuristic.cost }}</span>
      <div>G:{{ heuristic.distanceAtGoal }}</div>
      <div>H:{{ heuristic.distanceAtGoal + heuristic.cost }}</div>
    </div>
    <div v-if="debug" class="z-[1] flex flex-col gap-1 text-white">
      <span>X:{{ position.x }}</span>
      <span>Y:{{ position.y }}</span>
    </div>
    <img
      v-if="blocked && blockObjectClass"
      class="block-object image-pixelated pointer-events-none absolute z-[1] select-none"
      src="/assets/images/block-objects.png"
      alt="Block object"
      :class="blockObjectClass"
    />
  </div>
</template>

<script setup lang="ts">
import type { IBlockHeuristic } from '@/types/game'
import { GameBlockTypeEnum } from '@/enums/game'
import { isAdjacent, isAround } from '@/utils/helpers'
import { TransitionFade } from '@morev/vue-transitions'

const characterStore = useCharacterStore()

const props = defineProps({
  type: {
    type: String,
    default: GameBlockTypeEnum.GRASSY_1,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 }),
  },
  points: {
    type: Number,
    default: 0,
  },
  debug: {
    type: Boolean,
    default: false,
  },
  heuristic: {
    type: Object as PropType<IBlockHeuristic>,
    default: () => ({}),
  },
})

const typeMapping: {
  [key: string]: {
    bgClass: string
    borderClass: string
    objectClass?: string
  }
} = {
  [GameBlockTypeEnum.GRASSY_1]: {
    bgClass: 'bg-sk-color-block-grassy-primary',
    borderClass: 'border-sk-color-block-grassy-border',
    objectClass: 'block-grassy',
  },
  [GameBlockTypeEnum.GRASSY_2]: {
    bgClass: 'bg-sk-color-block-grassy-secondary',
    borderClass: 'border-sk-color-block-grassy-border',
    objectClass: 'block-grassy',
  },
  [GameBlockTypeEnum.ROCKY_1]: {
    bgClass: 'bg-sk-color-block-rocky-primary',
    borderClass: 'border-sk-color-block-rocky-border',
    objectClass: 'block-rocky',
  },
  [GameBlockTypeEnum.ROCKY_2]: {
    bgClass: 'bg-sk-color-block-rocky-secondary',
    borderClass: 'border-sk-color-block-rocky-border',
    objectClass: 'block-rocky',
  },
  [GameBlockTypeEnum.SANDY_1]: {
    bgClass: 'bg-sk-color-block-sandy-primary',
    borderClass: 'border-sk-color-block-sandy-border',
    objectClass: 'block-sandy',
  },
  [GameBlockTypeEnum.SANDY_2]: {
    bgClass: 'bg-sk-color-block-sandy-secondary',
    borderClass: 'border-sk-color-block-sandy-border',
    objectClass: 'block-sandy',
  },
  [GameBlockTypeEnum.SWAMPY_1]: {
    bgClass: 'bg-sk-color-block-swampy-primary',
    borderClass: 'border-sk-color-block-swampy-border',
    objectClass: 'block-swampy',
  },
  [GameBlockTypeEnum.SWAMPY_2]: {
    bgClass: 'bg-sk-color-block-swampy-secondary',
    borderClass: 'border-sk-color-block-swampy-border',
    objectClass: 'block-swampy',
  },
  [GameBlockTypeEnum.GOAL]: {
    bgClass: 'bg-[url("/assets/images/block-goal.png")] bg-center bg-cover',
    borderClass: 'border-black',
  },
}

const userIsInformed = computed(() => {
  return characterStore.currentPlayer?.informed
})

const blockIsAdjacent = computed(() => {
  return (
    characterStore.currentPlayer &&
    isAdjacent(
      props.position.x,
      props.position.y,
      characterStore.currentPlayer.position.x,
      characterStore.currentPlayer.position.y
    )
  )
})

const blockIsAround = computed(() => {
  return (
    characterStore.currentPlayer &&
    isAround(
      props.position.x,
      props.position.y,
      characterStore.currentPlayer.position.x,
      characterStore.currentPlayer.position.y,
      2
    )
  )
})

const blockIsGoal = computed(() => {
  return props.type === GameBlockTypeEnum.GOAL
})

const blockClass = computed(() => {
  const { bgClass, borderClass } = typeMapping[props.type] || {}
  return `${bgClass} ${borderClass}`
})

const blockObjectClass = computed(() => {
  return typeMapping[props.type]?.objectClass || null
})
</script>

<style scoped>
.block-object {
  min-width: calc(4 * theme('height.sk-height-block')) !important;
}

.block-object.block-grassy {
  left: calc(-1.02 * theme('width.sk-width-block')) !important;
  top: calc(0 * theme('height.sk-height-block')) !important;
}
.block-object.block-rocky {
  min-width: calc(3.7 * theme('width.sk-width-block')) !important;
  left: calc(-0.02 * theme('width.sk-width-block')) !important;
  top: calc(-0.92 * theme('height.sk-height-block')) !important;
}
.block-object.block-sandy {
  left: calc(-1.02 * theme('width.sk-width-block')) !important;
  top: calc(-1.05 * theme('height.sk-height-block')) !important;
}
.block-object.block-swampy {
  left: calc(-3.05 * theme('width.sk-width-block')) !important;
  top: calc(0 * theme('height.sk-height-block')) !important;
}
</style>
