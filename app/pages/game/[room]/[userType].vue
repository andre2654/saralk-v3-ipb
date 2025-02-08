<template>
  <div class="flex w-full flex-col gap-4">
    <MoleculesGameShareButton :roomId="roomId" />
    <div
      class="sk-border-pixelated relative flex h-[600px] w-full flex-col gap-4 overflow-hidden border-2 border-white p-2"
      :class="[
        characterStore.currentPlayer?.informed ? 'bg-blue-300' : 'bg-black',
      ]"
    >
      <OrganismsGameHeader
        @get-board-info="sendWebSocket(ActionMoveEnum.GET_BOARD_INFO)"
        @breadth-first-search="breadthFirstSearchWorker(roomId)"
        @depth-first-search="depthFirstSearchWorker(roomId)"
      />
      <MoleculesGameBoard />
      <MoleculesGameJoystick
        class="absolute bottom-2 right-2"
        @move-up="sendWebSocket(ActionMoveEnum.TOP)"
        @move-left="sendWebSocket(ActionMoveEnum.LEFT)"
        @move-right="sendWebSocket(ActionMoveEnum.RIGHT)"
        @move-down="sendWebSocket(ActionMoveEnum.DOWN)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IWebsocketResponse } from '@/types/websocket'
import type { TypeUserEnum } from '@/enums/game'
import { ActionMoveEnum } from '@/enums/game'
import { TypeResponseEnum } from '@/enums/websocket'
import {
  breadthFirstSearchWorker,
  depthFirstSearchWorker,
} from '@/utils/workers'

const websocket = useWebsocketStore()
const { initializeWebSocket, closeWebSocket, sendWebSocket } =
  useWebsocketStore()
const { startStopwatch, stopStopwatch } = useUtilitiesStore()
const { move, createGame, addPlayer, addMe, removePlayer, addBoardInfo } =
  useCharacterStore()
const characterStore = useCharacterStore()
const route = useRoute()
const router = useRouter()

const roomId: string = route.params.room as string
const userType: TypeUserEnum = route.params.userType as TypeUserEnum
const userName: string | null = route.query.userName as string
const userId: string | null = route.query.userId as string

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
        console.log('YOUR_PLAYER', response)

        if (!userId) {
          router.push({
            query: { userId: response.userId },
          })
        }

        addMe(response.userId, response.data)
        break
      case TypeResponseEnum.GAME_INFO:
        console.log('GAME_INFO')
        createGame(response.data)
        break
      case TypeResponseEnum.MOVE_PLAYER:
        console.log('MOVE_PLAYER', response)
        move(
          response.userId,
          response.direction,
          response.data,
          response.interactions
        )
        break
      case TypeResponseEnum.REMOVE_PLAYER:
        console.log('REMOVE_PLAYER')
        removePlayer(response.userId)
        break
      case TypeResponseEnum.BOARD_INFO:
        console.log('BOARD_INFO')
        addBoardInfo(response.board, response.userId)
        break
      case TypeResponseEnum.INVALID_ACTION:
        console.log(response.message)
        break
    }
  }
)

onMounted(() => {
  initializeWebSocket(roomId, userType, userName, userId)
  startStopwatch()
})

onUnmounted(() => {
  stopStopwatch()
  closeWebSocket()
})
</script>
