<template>
  <div
    class="no-scrollbar relative flex h-full w-full flex-1 flex-col overflow-auto"
    @scroll="handleScroll"
    :style="{ boxShadow: boxShadowStyle }"
  >
    <MoleculesGameNavesCharacter />
    <div class="-z-10 flex min-w-max" v-for="i in 30" :key="i">
      <AtomsGameGroundBlock
        v-for="(block, index) in blocks"
        :key="`${block.groundType}-${index}-${i}`"
        :groundType="block.groundType"
        :blocked="block.blocked"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GameBlockTypeEnum } from '@/enums/game'

const blocks = ref([
  { groundType: GameBlockTypeEnum.GRASSY_1, blocked: false },
  { groundType: GameBlockTypeEnum.GRASSY_1, blocked: true },
  { groundType: GameBlockTypeEnum.GRASSY_2, blocked: false },
  { groundType: GameBlockTypeEnum.GRASSY_2, blocked: true },
  { groundType: GameBlockTypeEnum.ROCKY_1, blocked: false },
  { groundType: GameBlockTypeEnum.ROCKY_1, blocked: true },
  { groundType: GameBlockTypeEnum.ROCKY_2, blocked: false },
  { groundType: GameBlockTypeEnum.ROCKY_2, blocked: true },
  { groundType: GameBlockTypeEnum.SANDY_1, blocked: false },
  { groundType: GameBlockTypeEnum.SANDY_1, blocked: true },
  { groundType: GameBlockTypeEnum.SANDY_2, blocked: false },
  { groundType: GameBlockTypeEnum.SANDY_2, blocked: true },
  { groundType: GameBlockTypeEnum.SWAMPY_1, blocked: false },
  { groundType: GameBlockTypeEnum.SWAMPY_1, blocked: true },
  { groundType: GameBlockTypeEnum.SWAMPY_2, blocked: false },
  { groundType: GameBlockTypeEnum.SWAMPY_2, blocked: true },
])

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
