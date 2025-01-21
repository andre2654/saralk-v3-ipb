<template>
  <div
    :class="[
      'relative flex h-sk-height-block w-sk-width-block cursor-pointer items-center justify-center overflow-hidden border-2 hover:opacity-40',
      blockClass,
    ]"
  >
    <div v-if="points" class="relative">
      <span
        class="absolute left-1/2 top-1/2 z-10 ms-[2.5px] mt-[2px] -translate-x-1/2 -translate-y-1/2 font-sk-font-pixel text-sm text-[#FFEAB4]"
        >{{ points }}</span
      >
      <img
        class="image-pixelated pointer-events-none select-none"
        src="/assets/images/bonus-ring-object.png"
        width="45"
        alt="Bonus object"
      />
    </div>
    <div v-if="debug" class="z-10 flex flex-col gap-1 text-white">
      <span>X:{{ position.x }}</span>
      <span>Y:{{ position.y }}</span>
    </div>
    <img
      v-if="blocked"
      class="block-object image-pixelated pointer-events-none absolute select-none"
      src="/assets/images/block-objects.png"
      alt="Block object"
      :class="blockObjectClass"
    />
  </div>
</template>

<script setup lang="ts">
import { GameBlockTypeEnum } from '@/enums/game'

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
})

const typeMapping: {
  [key: string]: {
    bgClass: string
    borderClass: string
    objectClass: string
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
}

const blockClass = computed(() => {
  const { bgClass, borderClass } = typeMapping[props.type] || {}
  return `${bgClass} ${borderClass}`
})

const blockObjectClass = computed(() => {
  return typeMapping[props.type]?.objectClass || ''
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
