<template>
  <div
    :id="`character-container-${userId}`"
    class="absolute z-[1]"
    :class="{
      'cursor-not-allowed opacity-50': !itsMe,
      hidden:
        characterStore.currentPlayer &&
        !itsMe &&
        !characterStore.currentPlayer.informed &&
        !isAdjacent(
          character.position.x,
          character.position.y,
          characterStore.currentPlayer.position.x,
          characterStore.currentPlayer.position.y
        ),
    }"
    :style="containerStyle"
  >
    <div
      class="absolute -top-[45px] left-0 flex min-w-max items-center gap-2"
      @mouseenter="showPointsBar = true"
      @mouseleave="showPointsBar = false"
    >
      <div
        class="flex items-center gap-1 rounded-full bg-black/70 px-3 py-2 text-white"
        :class="[itsMe ? 'cursor-help' : 'cursor-not-allowed']"
      >
        <div
          class="h-3 w-3 rounded-full"
          :class="[character.reachedGoal ? 'bg-sk-color-gold' : 'bg-white']"
        />
        <IconEye v-if="character.informed" class="h-4 w-4 fill-white" />
        {{ character.name }}
      </div>
      <TransitionSlide :offset="offsetSlide">
        <div
          v-show="showPointsBar"
          class="flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-white"
        >
          <span class="text-[#EEE5E0]"> {{ character.points }} pontos </span>
          <span>-</span>
          <span class="text-[#EEE5E0]">
            {{ character.iteractions }} iterações
          </span>
        </div>
      </TransitionSlide>
    </div>
    <div
      id="character"
      class="h-sk-height-block w-sk-width-block relative overflow-hidden"
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
import { isAdjacent } from '@/utils/helpers'
import { ActionMoveEnum, TypeUserEnum } from '@/enums/game'
import type { IPlayer } from '@/types/game'
import IconEye from '@/public/assets/icons/icon-eye.svg'
import { TransitionSlide } from '@morev/vue-transitions'

const characterStore = useCharacterStore()

const props = defineProps({
  userId: {
    type: String,
    default: '',
    required: true,
  },
})

const offsetSlide = {
  enter: [-16, 0],
  leave: [-16, 0],
}

const character = computed<IPlayer>(() => {
  if (characterStore.currentGame.players[props.userId]) {
    return characterStore.currentGame.players[props.userId]
  }
  return {
    name: '0',
    type: TypeUserEnum.PLAYER,
    position: {
      x: 0,
      y: 0,
    },
    informed: false,
    points: 0,
    iteractions: 0,
    direction: ActionMoveEnum.RIGHT,
    inMovement: false,
    movementTimeout: null,
    reachedGoal: false,
    inGame: true,
  }
})

const itsMe = computed(() => characterStore.currentPlayerId === props.userId)

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
  const spectatorTopValue = '-485px'

  const style: Record<string, string> = {
    top:
      character.value.type === TypeUserEnum.SPECTATOR
        ? spectatorTopValue
        : topValue,
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
