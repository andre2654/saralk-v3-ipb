<template>
  <div
    id="game-board"
    v-dragscroll
    class="no-scrollbar relative flex h-full w-full flex-1 cursor-move flex-col overflow-scroll px-[200px] py-[60px]"
  >
    <MoleculesGameCharacter
      v-for="userId in characterStore.allPlayersIds"
      v-show="characterStore.allPlayers[userId].inGame"
      :key="userId"
      :user-id="userId"
    />
    <div
      v-for="(boardX, yIndex) in characterStore.game?.board"
      :key="yIndex"
      class="pointer-events-none -z-10 flex min-w-max select-none"
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
