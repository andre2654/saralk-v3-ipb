<template>
  <div
    id="character-container"
    class="absolute z-[1] h-sk-height-block w-sk-width-block overflow-hidden"
    :style="containerStyle"
  >
    <div id="character" class="relative">
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
const characterStore = useCharacterStore()

const skHeightBlock = 90

const containerStyle = computed(() => ({
  left: `calc(8px + (${characterStore.position.x} * ${skHeightBlock}px))`,
  top: `calc(-5px + (${characterStore.position.y} * ${skHeightBlock}px))`,
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

  if (characterStore.inMovement) {
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
  const topMultiplier = topValues[characterStore.direction]
  const topValue = `calc(${topMultiplier} * ${skHeightBlock}px)`

  const style: Record<string, string> = {
    top: topValue,
  }
  return style
})

watch(
  () => [characterStore.position.x, characterStore.position.y],
  () => {
    if (document && document.getElementById('character-container')) {
      setTimeout(() => {
        document.getElementById('character-container')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        })
      }, 300)
    }
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
