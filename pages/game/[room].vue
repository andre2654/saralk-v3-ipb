<template>
  <NuxtLayout>
    <div
      class="sk-border-pixelated relative flex h-[600px] w-full flex-col gap-4 overflow-hidden border-2 border-white bg-blue-300 p-2"
    >
      <OrganismsGameHeader />
      <MoleculesGameBoard />
      <MoleculesGameJoystick
        class="absolute bottom-5 right-5"
        @moveUp="sendWebSocket('top')"
        @moveLeft="sendWebSocket('left')"
        @moveRight="sendWebSocket('right')"
        @moveDown="sendWebSocket('down')"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { IWebsocketResponse } from '@/types/websocket'
import { TypeResponseEnum } from '@/enums/websocket'

const websocket = useWebsocketStore()
const { initializeWebSocket, closeWebSocket, sendWebSocket } =
  useWebsocketStore()
const { startStopwatch, stopStopwatch } = useUtilitiesStore()
const { move, createGame, addPlayer, addMe, removePlayer } = useCharacterStore()
const route = useRoute()

const roomId: string = route.params.room as string

watch(
  () => websocket?.websocket?.data,
  (value) => {
    if (!value) return

    const response: IWebsocketResponse = JSON.parse(value)
    const type = response.type

    switch (type) {
      case TypeResponseEnum.NEW_PLAYER:
        console.log('NEW_PLAYER')
        addPlayer(response.userId, response.data)
        break
      case TypeResponseEnum.YOUR_PLAYER:
        console.log('YOUR_PLAYER')
        addMe(response.userId, response.data)
        break
      case TypeResponseEnum.GAME_INFO:
        console.log('GAME_INFO')
        createGame(response.data)
        break
      case TypeResponseEnum.MOVE_PLAYER:
        console.log(
          'MOVE_PLAYER',
          response.userId,
          response.direction,
          response.data,
          response.interaction
        )
        move(
          response.userId,
          response.direction,
          response.data,
          response.interaction
        )
        break
      case TypeResponseEnum.REMOVE_PLAYER:
        console.log('REMOVE_PLAYER')
        removePlayer(response.userId)
        break
      case TypeResponseEnum.INVALID_ACTION:
        console.log(response.message)
        break
    }
  }
)

onMounted(() => {
  initializeWebSocket(roomId)
  startStopwatch()
})

onUnmounted(() => {
  stopStopwatch()
  closeWebSocket()
})
</script>
