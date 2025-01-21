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
      class="group absolute -left-[15px] -top-[45px] flex min-w-max items-center gap-2"
    >
      <AtomsPixelatedBox
        class="border-sk-color-gold px-3 pb-[5px] pt-[8px] text-xs text-sk-color-gold"
        :class="[itsMe ? 'cursor-help' : 'cursor-not-allowed']"
      >
        Usuário {{ character.id }}
      </AtomsPixelatedBox>
      <AtomsPixelatedBox
        class="items-center gap-3 border-sk-color-gold px-5 pb-[5px] pt-[8px] text-xs"
        :class="{
          flex: showPointsBar,
          hidden: !showPointsBar,
          'group-hover:flex': itsMe,
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
import { ActionMoveEnum } from '@/enums/actions'
import type { IPlayer } from '@/types/game'

const characterStore = useCharacterStore()

const props = defineProps({
  userId: {
    type: String,
    default: '',
    required: true,
  },
})

const character = computed<IPlayer>(() => {
  if (!characterStore.game.players[props.userId]) {
    return {
      id: 0,
      position: {
        x: 0,
        y: 0,
      },
      points: 0,
      iteractions: 0,
      direction: ActionMoveEnum.RIGHT,
      inMovement: false,
      movementTimeout: null,
    }
  }
  return characterStore.game.players[props.userId]
})

const itsMe = computed(() => characterStore.me === props.userId)

const skHeightBlock = 90

const containerStyle = computed(() => ({
  left: `calc(208px + (${character.value.position.x} * ${skHeightBlock}px))`,
  top: `calc(45px + (${character.value.position.y} * ${skHeightBlock}px))`,
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

let isScrolling = false

watch(
  () => [character.value.position.x, character.value.position.y],
  () => {
    if (!itsMe.value) return // Só segue o personagem do próprio usuário

    const characterElement = document.getElementById(
      `character-container-${characterStore.me}`
    )

    if (characterElement && !isScrolling) {
      isScrolling = true

      const followScroll = () => {
        characterElement.scrollIntoView({
          block: 'center',
          inline: 'center',
          behavior: 'auto',
        })

        if (character.value.inMovement) {
          requestAnimationFrame(followScroll)
        } else {
          isScrolling = false
        }
      }

      requestAnimationFrame(followScroll)
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
