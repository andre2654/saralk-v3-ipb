<template>
  <div
    v-dragscroll
    id="game-board"
    class="no-scrollbar relative flex h-full w-full flex-1 cursor-move flex-col overflow-scroll px-[200px] py-[60px]"
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
</script>
