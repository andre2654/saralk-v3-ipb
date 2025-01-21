import { useWebSocket } from '@vueuse/core'

interface Websocket {
  data: Ref
  send: (data: any) => void
  close: () => void
}

export const useWebsocketStore = defineStore('websocket', {
  state: () => {
    return {
      websocket: null as Websocket | null,
      heartBeat: null as any,
    }
  },
  actions: {
    initializeWebSocket(roomId: string) {
      const connection_url = `ws://localhost:3000/api/websocket?room=${roomId}`

      const { data, send, close } = useWebSocket(connection_url)

      // this.heartBeat = setInterval(() => {
      //   send(JSON.stringify({ online: roomId }))
      // }, 120000)

      this.websocket = { data, send, close }
    },
    sendWebSocket(data: string) {
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
