<template>
  <div
    v-dragscroll
    id="game-board"
    class="no-scrollbar relative flex h-full w-full flex-1 cursor-move flex-col overflow-scroll"
    @scroll="handleScroll"
    :style="{ boxShadow: boxShadowStyle }"
  >
    <MoleculesGameNavesCharacter
      v-for="userId in characterStore.getAllPlayers()"
      :key="userId"
      :userId="userId"
    />
    <div
      class="pointer-events-none -z-10 flex min-w-max select-none"
      v-for="(boardX, yIndex) in characterStore.game?.board"
      :key="yIndex"
    >
      <AtomsGameGroundBlock
        v-for="({ type, isBlocked, points }, xIndex) in boardX"
        :key="xIndex"
        :type="type"
        :blocked="isBlocked"
        :position="{ x: xIndex, y: yIndex }"
        :points="points"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const characterStore = useCharacterStore()

const boxShadowStyle = ref('none')
const handleScroll = (event: Event) => {
  const scrollContainer: HTMLElement | null = event.target as HTMLElement
  if (!scrollContainer) return
  const {
    scrollLeft,
    scrollWidth,
    clientWidth,
    scrollTop,
    scrollHeight,
    clientHeight,
  } = scrollContainer
  const maxScrollLeft = scrollWidth - clientWidth
  const maxScrollTop = scrollHeight - clientHeight

  const shadows = []

  if (scrollLeft > 0) {
    shadows.push('inset 20px 0 10px -10px rgba(0, 0, 0, 0.5)')
  }
  if (scrollLeft < maxScrollLeft) {
    shadows.push('inset -20px 0 10px -10px rgba(0, 0, 0, 0.5)')
  }
  if (scrollTop > 0) {
    shadows.push('inset 0 20px 10px -10px rgba(0, 0, 0, 0.5)')
  }
  if (scrollTop < maxScrollTop) {
    shadows.push('inset 0 -20px 10px -10px rgba(0, 0, 0, 0.5)')
  }

  boxShadowStyle.value = shadows.join(', ')
}
</script>
