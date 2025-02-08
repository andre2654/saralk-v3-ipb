import { useWebSocket } from '@vueuse/core'
import type { ActionMoveEnum, TypeUserEnum } from '@/enums/game'
import { ActionMoveEnum as ActionMoveEnumValue } from '@/enums/game'

interface Websocket {
  data: Ref
  send: (data: ActionMoveEnum) => void
  close: () => void
}

export const useWebsocketStore = defineStore('websocket', {
  state: () => {
    return {
      websocket: null as Websocket | null,
      heartBeat: null as NodeJS.Timer | null,
    }
  },
  actions: {
    initializeWebSocket(roomId: string, userType: TypeUserEnum, userName: string | null, userId: string | null) {
      const host = window.location.host
      let connection_url = `ws://${host}/api/websocket?room=${roomId}&userType=${userType}`

      if (userName) {
        connection_url += `&userName=${userName}`
      }
      if (userId) {
        connection_url += `&userId=${userId}`
      }

      const { data, send, close } = useWebSocket(connection_url)

      this.heartBeat = setInterval(() => {
        send(ActionMoveEnumValue.HEARTBEAT)
      }, 120000)

      this.websocket = { data, send, close }
    },
    sendWebSocket(data: ActionMoveEnum) {
      if (!this.websocket) return
      this.websocket.send(data)
    },
    closeWebSocket() {
      if (!this.websocket) return
      this.websocket.close()
      this.websocket = null

      // clearInterval(this.heartBeat)
    },
  },
})
