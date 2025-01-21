import type { IPlayer, IGame } from '@/types/game';
import type { IInteractionGetPoints } from '@/types/websocket';
import { ActionMoveEnum } from '@/enums/actions'

interface IState {
  me: string
  game: IGame
}

export const useCharacterStore = defineStore('character', {
  state: (): IState => {
    return {} as IState
  },
  actions: {
    createGame(game: IGame) {
      this.game = game
    },
    addPlayer(userId: string, player: IPlayer) {
      this.game.players[userId] = player
    },
    addMe(userId: string, player: IPlayer) {
      this.me = userId
      this.game.players[userId] = player
    },
    move(userId: string, direction: ActionMoveEnum, data: IPlayer, interaction?: IInteractionGetPoints) {
      const player = this.game.players[userId]

      player.direction = direction

      if (player.inMovement) {
        return
      } else {
        player.inMovement = true
      }


      if (player.movementTimeout) {
        clearTimeout(player.movementTimeout)
      }

      player.movementTimeout = window.setTimeout(() => {
        player.inMovement = false
        player.movementTimeout = null
      }, 350)

      this.game.players[userId].position = data.position

      player.iteractions = data.iteractions

      if (interaction) {
        player.points = data.points
        this.getPointFromBlock(data.position.x, data.position.y)
      }
    },
    removePlayer(userId: string) {
      delete this.game.players[userId]
    },
    getPointFromBlock(x: number, y: number) {
      const block = this.game.board[y][x]
      block.points = 0
    },
    getAllPlayers() {
      if (!this.game?.players) {
        return []
      }

      return Object.keys(this.game.players)
    }
  },
})
