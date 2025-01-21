<template>
  <div
    :id="`character-container-${userId}`"
    class="absolute z-[1]"
    :class="{
      'cursor-not-allowed opacity-50': !itsMe,
    }"
    :style="containerStyle"
  >
    <div
      class="group absolute -top-[40px] left-[60px] flex min-w-max items-center gap-2"
    >
      <IconInfo
        class="h-10 w-10"
        :class="[itsMe ? 'cursor-help' : 'cursor-not-allowed']"
      />
      <AtomsPixelatedBox
        class="flex items-center gap-3 border-sk-color-gold px-5 pb-[5px] pt-[8px] text-xs opacity-0"
        :class="{
          'opacity-100': showPointsBar,
          'opacity-0': !showPointsBar,
          'transition-opacity group-hover:opacity-100': itsMe,
        }"
      >
        <span class="text-[#EEE5E0]"> {{ character.points }} pontos </span>
        <div class="mb-1 h-[15px] w-[2px] bg-sk-color-gold" />
        <span class="text-[#EEE5E0]">
          {{ character.iteractions }} iterações
        </span>
      </AtomsPixelatedBox>
    </div>
    <div
      id="character"
      class="relative h-sk-height-block w-sk-width-block overflow-hidden"
    >
      <img
        :class="characterClass"
        :style="characterStyle"
        src="/assets/images/character.png"
        alt="Naves Character"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import IconInfo from '@/public/assets/icons/icon-info.svg'

const characterStore = useCharacterStore()

const props = defineProps({
  userId: {
    type: String,
    default: '',
    required: true,
  },
})

const character = computed(() => {
  if (!characterStore.game.players[props.userId]) {
    return {
      position: { x: 0, y: 0 },
      direction: 'right',
      inMovement: false,
      points: 0,
      iteractions: 0,
    }
  }
  return characterStore.game.players[props.userId]
})

const itsMe = computed(() => characterStore.me === props.userId)

const skHeightBlock = 90

const containerStyle = computed(() => ({
  left: `calc(8px + (${character.value.position.x} * ${skHeightBlock}px))`,
  top: `calc(-5px + (${character.value.position.y} * ${skHeightBlock}px))`,
  transition: '0.3s ease-in-out',
}))

const characterClass = computed(() => {
  const classes = [
    'image-pixelated',
    'pointer-events-none',
    'absolute',
    'min-w-[400px]',
    'select-none',
  ]

  if (character.value.inMovement) {
    classes.push('is-walking')
  }

  return classes
})

const topValues: {
  [key: string]: number
} = {
  right: -1.32,
  top: -2.7,
  left: -4,
  down: 0,
}

const characterStyle = computed(() => {
  const topMultiplier = topValues[character.value.direction]
  const topValue = `calc(${topMultiplier} * ${skHeightBlock}px)`

  const style: Record<string, string> = {
    top: topValue,
  }
  return style
})

watch(
  () => [character.value.position.x, character.value.position.y],
  () => {
    const characterElement = document.getElementById(
      `character-container-${characterStore.me}`
    )
    if (document && characterStore.me && characterElement) {
      setTimeout(() => {
        characterElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        })
      }, 500)
    }
  }
)

const showPointsBar = ref(false)
let timeoutId: ReturnType<typeof setTimeout> | null = null

watch(
  () => character.value.points,
  () => {
    if (!itsMe.value) {
      return
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    showPointsBar.value = true

    timeoutId = setTimeout(() => {
      showPointsBar.value = false
    }, 3000)
  }
)
</script>

<style scoped>
@keyframes moveSpritesheet {
  from {
    transform: translate3d(0px, 0, 0);
  }
  to {
    transform: translate3d(-108.5%, 0, 0);
  }
}

img.is-walking {
  animation: moveSpritesheet 0.5s steps(4) infinite;
}
</style>
