import {
  GameBlockTypeEnum,
  ActionMoveEnum,
  TypeUserEnum as TypeUserEnumValue,
} from '@/enums/game'
import type { TypeUserEnum } from '@/enums/game'
import { TypeResponseEnum, TypeInteractionEnum } from '@/enums/websocket'
import type {
  IWebsocketResponse,
  IInteractions,
  IInteractionReachedGoal,
  IInteractionGetPoints,
  IAdjacentBlocks,
} from '@/types/websocket'
import type { Peer } from 'crossws'
import {
  generatePlayer,
  generateBoard,
  getAdjacentBlocks,
} from '@/server/utils/helpers'
import { Game } from '@/server/models/game.model'

const BOARD_SIZE = 20

interface PeerWithRoom extends Peer {
  room: string
  userId: string
}

export default defineWebSocketHandler({
  async open(peer) {
    try {
      const peerWithRoom = peer as PeerWithRoom

      const url = peerWithRoom?.request?.url

      if (!url) {
        console.error('Cabeçalhos ou URL inválidos na requisição')
        peerWithRoom.close()
        return
      }

      const parsedUrl: URL = new URL(url)
      const roomId: string | null = parsedUrl.searchParams.get('room')
      const userName: string | null = parsedUrl.searchParams.get('userName')

      const userType: TypeUserEnum =
        (parsedUrl.searchParams.get('userType') as TypeUserEnum) ||
        TypeUserEnumValue.PLAYER

      if (!roomId) {
        console.error('ID da sala não especificado na URL')
        peerWithRoom.close()
        return
      }

      const peerId = peerWithRoom.id
      peerWithRoom.room = roomId

      const userId: string = parsedUrl.searchParams.get('userId') || peerId
      peerWithRoom.userId = userId

      peerWithRoom.subscribe(roomId)

      let game = await Game.findOne({ room: roomId })
      if (!game) {
        game = new Game({
          room: roomId,
          quantityPlayersEntered: 0,
          board: generateBoard(BOARD_SIZE),
          players: {},
        })
      }

      let player = game.players.get(userId)
      if (!player) {
        player = generatePlayer(
          game.quantityPlayersEntered,
          userName,
          userType,
          peerId
        )
        game.quantityPlayersEntered += 1
        await game.save()
      } else {
        player.peerId = peerId
        player.inGame = true
      }

      game.players.set(userId, player)
      game.markModified('players');
      await game.save()

      const adjacentBlocks: IAdjacentBlocks = getAdjacentBlocks(
        game.board,
        player
      )

      console.log(`Peer conectado à sala: ${roomId}`)

      const responseYourPlayer: IWebsocketResponse = {
        type: TypeResponseEnum.YOUR_PLAYER,
        userId: userId,
        data: player,
        adjacentBlocks: adjacentBlocks,
      }

      const responseNewPlayer: IWebsocketResponse = {
        type: TypeResponseEnum.NEW_PLAYER,
        userId: userId,
        data: player,
      }

      const responseGameInfo: IWebsocketResponse = {
        type: TypeResponseEnum.GAME_INFO,
        data: game,
      }

      // Envia a mensagem de volta para o peer que enviou
      peerWithRoom.send(JSON.stringify(responseGameInfo))

      // Envia a mensagem para todos os peers na sala
      peerWithRoom.publish(peerWithRoom.room, JSON.stringify(responseNewPlayer))

      // Envia a mensagem de volta para o peer que enviou
      peerWithRoom.send(JSON.stringify(responseYourPlayer))
    } catch (error) {
      console.error('Erro ao processar conexão:', error)
      peer.close()
    }
  },

  async close(peer) {
    const roomId = (peer as PeerWithRoom)?.room
    if (!roomId) {
      console.error('Nenhuma sala associada a este peer')
      return
    }

    const game = await Game.findOne({ room: roomId });
    if (!game) {
      console.error('Sala não encontrada');
      return;
    }

    const userId = (peer as PeerWithRoom)?.userId
    if (!userId) {
      console.error('Jogador não encontrado');
      return;
    }

    const player = game.players.get(userId);

    player.inGame = false;
    game.players.set(userId, player);
    game.markModified('players');
    await game.save();

    const responseRemovePlayer: IWebsocketResponse = {
      type: TypeResponseEnum.REMOVE_PLAYER,
      userId: userId,
    }

    // Envia a mensagem para todos os peers na sala
    peer.publish(roomId, JSON.stringify(responseRemovePlayer))

    console.log(`Conexão fechada (Peer ID: ${userId})`)
  },

  error(peer, error) {
    const userId = peer.id

    console.error(`Erro no peer (ID: ${userId}):`, error)
  },

  async message(peer, message) {
    try {
      const peerWithRoom = peer as PeerWithRoom
      const roomId = peerWithRoom?.room
      const userId = peerWithRoom?.userId

      if (!roomId) {
        console.error('Nenhuma sala associada a este peer')
        peerWithRoom.close()
        return
      }

      const game = await Game.findOne({ room: roomId });
      if (!game) {
        console.error('Jogo não encontrado na sala');
        peerWithRoom.close();
        return;
      }

      const messageText = message.text() as ActionMoveEnum
      console.log(`Mensagem recebida: ${messageText}`)

      if (!userId) {
        console.error('Jogador não encontrado');
        peerWithRoom.close();
        return;
      }

      const player = game.players.get(userId);

      const board = game.board;
      if (!board) {
        console.error('Tabuleiro não encontrado');
        peerWithRoom.close();
        return;
      }

      if (messageText === ActionMoveEnum.HEARTBEAT) {
        return
      }

      if (!player.movementTimeout) {
        player.movementTimeout = new Date().getTime()
      } else if (new Date().getTime() - player.movementTimeout < 350) {
        const responseInvalidAction: IWebsocketResponse = {
          type: TypeResponseEnum.INVALID_ACTION,
          userId: userId,
          message: 'Aguarde um pouco antes de se mover novamente',
        }

        // Envia a mensagem de volta para o peer que enviou
        peerWithRoom.send(JSON.stringify(responseInvalidAction))

        return
      } else if (player.reachedGoal) {
        const responseInvalidAction: IWebsocketResponse = {
          type: TypeResponseEnum.INVALID_ACTION,
          userId: userId,
          message: 'Você já alcançou o objetivo',
        }

        // Envia a mensagem de volta para o peer que enviou
        peerWithRoom.send(JSON.stringify(responseInvalidAction))

        return
      } else {
        player.movementTimeout = new Date().getTime()
      }

      const interactions = {} as IInteractions
      const adjacentBlocks: IAdjacentBlocks = getAdjacentBlocks(board, player)
      var adjacentBlocksAfterMove: IAdjacentBlocks = {} as IAdjacentBlocks

      if (messageText === ActionMoveEnum.GET_BOARD_INFO) {
        const responseBoardInfo: IWebsocketResponse = {
          type: TypeResponseEnum.BOARD_INFO,
          board: board,
          userId: userId,
        }

        player.informed = true
        game.players.set(userId, player);
        game.markModified('players');
        await game.save();

        // Envia a mensagem de volta para o peer que enviou
        peerWithRoom.send(JSON.stringify(responseBoardInfo))

        return
      } else if (
        [
          ActionMoveEnum.LEFT,
          ActionMoveEnum.RIGHT,
          ActionMoveEnum.TOP,
          ActionMoveEnum.DOWN,
        ].includes(messageText)
      ) {
        const adjacentBlocks = getAdjacentBlocks(board, player)
        const nextBlock = adjacentBlocks[messageText]

        if (
          nextBlock &&
          (!nextBlock.isBlocked || player.type === TypeUserEnumValue.SPECTATOR)
        ) {
          const blockType = nextBlock.type
          const blockPoints = nextBlock.points

          if (player.type !== TypeUserEnumValue.SPECTATOR) {
            if (blockType === GameBlockTypeEnum.GOAL) {
              player.reachedGoal = true
              interactions[TypeInteractionEnum.REACHED_GOAL] = <
                IInteractionReachedGoal
                >{
                  position: {
                    x: nextBlock.position.x,
                    y: nextBlock.position.y,
                  },
                }
            }
            if (blockPoints) {
              player.points += blockPoints
              nextBlock.points = 0

              interactions[TypeInteractionEnum.GET_POINTS] = <
                IInteractionGetPoints
                >{
                  position: {
                    x: nextBlock.position.x,
                    y: nextBlock.position.y,
                  },
                  points: blockPoints,
                }
            }
          }

          player.direction = messageText
          player.position.x = nextBlock.position.x
          player.position.y = nextBlock.position.y
        }

        adjacentBlocksAfterMove = getAdjacentBlocks(board, player)
        player.iteractions += 1
      }

      game.players.set(userId, player);
      game.markModified('players');
      await game.save();

      const response: IWebsocketResponse = {
        type: TypeResponseEnum.MOVE_PLAYER,
        userId: userId,
        direction: messageText,
        interactions: interactions,
        data: player,
        adjacentBlocks: adjacentBlocksAfterMove,
      }

      // Envia a mensagem para todos os peers na sala
      peerWithRoom.publish(roomId, JSON.stringify(response))

      // Envia a mensagem de volta para o peer que enviou
      peerWithRoom.send(JSON.stringify(response))
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
    }
  },
})
