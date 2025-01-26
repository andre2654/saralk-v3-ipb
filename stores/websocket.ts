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
    initializeWebSocket(roomId: string, userType: TypeUserEnum, userName: string | null) {
      const host = window.location.host
      const connection_url = `wss://${host}/api/websocket?room=${roomId}&userType=${userType}&userName=${userName}`

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
