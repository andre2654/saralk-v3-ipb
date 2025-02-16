<template>
  <div class="flex flex-col items-center justify-center gap-1">
    <AtomsButton @click="emits('moveUp')" class="h-[55px] w-[55px]">
      <IconArrowUp />
    </AtomsButton>
    <div class="flex items-center gap-1">
      <AtomsButton @click="emits('moveLeft')" class="h-[55px] w-[55px]">
        <IconArrowLeft />
      </AtomsButton>
      <AtomsButton class="h-[55px] w-[55px]" @click="scrollToCharacter">
        <img
          class="image-pixelated pointer-events-none select-none"
          src="/assets/images/character-picture.png"
          alt="Character picture"
        />
        {{ characterIsNotInViewport }}
      </AtomsButton>
      <AtomsButton @click="emits('moveRight')" class="h-[55px] w-[55px]">
        <IconArrowRight />
      </AtomsButton>
    </div>
    <AtomsButton @click="emits('moveDown')" class="h-[55px] w-[55px]">
      <IconArrowDown />
    </AtomsButton>
  </div>
</template>

<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import IconArrowUp from '@/public/assets/icons/icon-arrow-up.svg'
import IconArrowDown from '@/public/assets/icons/icon-arrow-down.svg'
import IconArrowLeft from '@/public/assets/icons/icon-arrow-left.svg'
import IconArrowRight from '@/public/assets/icons/icon-arrow-right.svg'

const characterStore = useCharacterStore()
const interfaceStore = useInterfaceStore()

const emits = defineEmits(['moveUp', 'moveLeft', 'moveRight', 'moveDown'])

onKeyStroke(
  ['w', 'W', 'ArrowUp'],
  (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
    }
    emits('moveUp')
  },
  { dedupe: true }
)

onKeyStroke(
  ['s', 'S', 'ArrowDown'],
  (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
    }
    emits('moveDown')
  },
  { dedupe: true }
)

onKeyStroke(
  ['a', 'A', 'ArrowLeft'],
  (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
    }
    emits('moveLeft')
  },
  { dedupe: true }
)

onKeyStroke(
  ['d', 'D', 'ArrowRight'],
  (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
    }
    emits('moveRight')
  },
  { dedupe: true }
)

const scrollToCharacter = () => {
  const characterElement = document.getElementById(
    `character-container-${characterStore.me}`
  )
  if (document && characterStore.me && characterElement) {
    characterElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })
  }
}
</script>
