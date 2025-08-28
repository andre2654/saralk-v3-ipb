import type { IPlayer, IPlayers, IGame, IBoard } from '@/types/game';
import type { IInteractions } from '@/types/websocket';
import type { ActionMoveEnum } from '@/enums/game'
import { TypeInteractionEnum } from '@/enums/websocket';

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
    move(userId: string, direction: ActionMoveEnum, data: IPlayer, interactions: IInteractions) {
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

      // Atualiza a posição
      this.game.players[userId].position = data.position
      
      // Atualiza o histórico de posições
      if (data.positionsHistory) {
        this.game.players[userId].positionsHistory = data.positionsHistory
      }

      player.iteractions = data.iteractions

      if (interactions[TypeInteractionEnum.GET_POINTS]) {
        player.points = data.points
        this.game.board[data.position.y][data.position.x].points = 0
      }
      if (interactions[TypeInteractionEnum.REACHED_GOAL]) {
        player.reachedGoal = true
      }
    },
    removePlayer(userId: string) {
      delete this.game.players[userId]
    },
    addBoardInfo(board: IBoard, userId: string) {
      this.game.board = board
      this.game.players[userId].informed = true
    },
  },
  getters: {
    currentPlayer(state): IPlayer | null {
      if (!state.game?.players || !state.me) {
        return null
      }
      return state.game.players[state.me]
    },
    currentPlayerId(state): string {
      return state.me
    },
    allPlayers(state): IPlayers {
      if (!state.game?.players) {
        return {}
      }

      return state.game.players
    },
    allPlayersIds(state): string[] {
      if (!state.game?.players) {
        return []
      }

      return Object.keys(state.game.players)
    },
    currentGame(state): IGame {
      return state.game
    }
  },
})
