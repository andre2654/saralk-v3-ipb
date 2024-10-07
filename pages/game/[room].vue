<template>
  <NuxtLayout>
    <div
      class="sk-border-pixelated relative flex h-[600px] w-full flex-col gap-4 overflow-hidden border-2 border-white bg-blue-300 p-2"
    >
      <OrganismsGameHeader />
      <MoleculesGameBoard />
      <MoleculesGameJoystick class="absolute bottom-5 right-5" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ActionMoveEnum } from '@/enums/actions'
import { useWebSocket } from '@vueuse/core'
const { startStopwatch, stopStopwatch } = useUtilitiesStore()
const { moveUp, moveLeft, moveRight, moveDown } = useCharacterStore()

const route = useRoute()

const { status, data, send, close } = useWebSocket(
  `ws://localhost:3000/api/websocket?room=${route.params.room}`
)
const history = ref<string[]>([])

watch(data, (newData) => {
  const newWSMessage = JSON.parse(newData)
  const uuid: string = newWSMessage.uuid
  const message: ActionMoveEnum = newWSMessage.message

  switch (message) {
    case ActionMoveEnum.TOP:
      moveUp()
      break
    case ActionMoveEnum.LEFT:
      moveLeft()
      break
    case ActionMoveEnum.RIGHT:
      moveRight()
      break
    case ActionMoveEnum.DOWN:
      moveDown()
      break
  }
})

onMounted(() => {
  startStopwatch()
})

onUnmounted(() => {
  stopStopwatch()
  close()
})
</script>
