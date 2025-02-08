<template>
  <div class="flex w-full max-w-[400px] flex-col items-center gap-5">
    <input
      v-model="gameForm.name"
      class="sk-border-pixelated w-full border-4 border-sk-color-border bg-sk-color-bg fill-sk-color-border p-3 text-center font-sk-font-pixel text-sk-color-border"
      type="text"
      placeholder="Digite seu nome"
    />

    <div class="flex flex-col gap-3">
      <span class="font-sk-font-pixel text-xs text-white"
        >Selecione o modo do jogo:</span
      >
      <div class="flex w-full items-center justify-between">
        <div
          v-for="character in chooseCharacterType"
          :key="character.id"
          class="flex cursor-pointer flex-col gap-4 transition-all"
          :class="[
            gameForm.type && gameForm.type !== character.id
              ? 'text-sk-color-border opacity-50'
              : 'px-[50px] text-sk-color-gold',
          ]"
          @click="selectCharacterType(character.id)"
        >
          <img
            class="image-pixelated"
            :src="character.image"
            :alt="character.name"
          />
          <span class="mx-auto font-sk-font-pixel">{{ character.name }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <input
        v-model="gameForm.roomId"
        class="sk-border-pixelated w-full border-4 border-sk-color-border bg-sk-color-bg fill-sk-color-border p-3 text-center font-sk-font-pixel text-sk-color-border"
        type="text"
        placeholder="Digite a sala"
      />
      <span class="text-center font-sk-font-pixel text-xs text-white"
        >Ou deixe em branco para entrar em uma nova sala</span
      >
    </div>

    <AtomsButton :to="gameUrl" class="w-full max-w-[200px]">
      {{ $t('general.play') }}
    </AtomsButton>
  </div>
</template>

<script setup lang="ts">
import { TypeUserEnum } from '@/enums/game'
import { v4 as uuidv4 } from 'uuid'

const chooseCharacterType = ref([
  {
    id: TypeUserEnum.PLAYER,
    image: '/assets/images/character-player.png',
    name: 'Jogador',
  },
  {
    id: TypeUserEnum.SPECTATOR,
    image: '/assets/images/character-spectator.png',
    name: 'Espectador',
  },
])

function selectCharacterType(id: string) {
  gameForm.type = id
}

const gameForm = reactive<{
  name: string
  type: string
  roomId: string | null
}>({
  name: '',
  type: TypeUserEnum.PLAYER,
  roomId: null,
})

const gameUrl = computed(() => {
  const roomId = gameForm.roomId || uuidv4()
  return `/game/${roomId}/${gameForm.type}/${gameForm.name}`
})
</script>
