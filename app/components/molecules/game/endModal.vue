<template>
  <tdiv
    class="font-sk-font-pixel no-scrollbar absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center gap-[50px] overflow-scroll bg-[#2E2D2D] py-[50px]"
  >
    <div class="text-sk-color-border text-center">
      <h2 class="text-[30px]">Parabéns</h2>
      <h3 class="text-[15px]">
        você chegou em {{ characterStore.currentPlayer?.iteractions }} iterações
      </h3>
    </div>
    <div class="text-sk-color-border flex w-[600px] flex-col gap-4">
      <div>Seus dados:</div>
      <div class="flex flex-col gap-5">
        {{ characterStore.currentPlayer?.points }} Pontos
      </div>
      <div v-if="characterStore.currentPlayer?.informed">Informado</div>
      <div v-else>Não informado</div>
    </div>
    <div class="flex w-[600px] flex-col gap-4">
      <div class="text-sk-color-border">Ranking:</div>
      <div class="flex flex-col gap-5">
        <AtomsRankingTag
          v-for="(player, idx) in ranking"
          :key="idx"
          :number="idx"
          :name="player.name"
          :iterations="player.iteractions"
          :is-informed="player.informed"
          :is-me="player.peerId === characterStore.currentPlayer?.peerId"
        />
      </div>
    </div>
  </tdiv>
</template>

<script setup lang="ts">
const characterStore = useCharacterStore()

const ranking = computed(() => {
  const player = Object.values(characterStore.allPlayers)
  if (!player) return []
  return player
    .filter((player) => player.reachedGoal)
    .sort((a, b) => a.iteractions - b.iteractions)
})
</script>
