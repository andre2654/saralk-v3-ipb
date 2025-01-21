import { ActionMoveEnum } from '@/enums/actions';
import { TypeResponseEnum, TypeInteractionEnum } from '@/enums/websocket';
import type { IWebsocketResponse, IInteractionGetPoints } from '@/types/websocket';
import type { IAllGames, IGame } from '@/types/game';
import type { Peer } from 'crossws';
import { generatePlayer, generateBoard, getAdjacentBlock } from '@/server/utils/helpers'

const BOARD_SIZE = 20;

const DB: IAllGames = {}

interface PeerWithRoom extends Peer {
  room: string;
}

export default defineWebSocketHandler({
  open(peer) {
    try {
      const peerWithRoom = peer as PeerWithRoom;

      const url = peerWithRoom?.request?.url;

      if (!url) {
        console.error('Cabeçalhos ou URL inválidos na requisição');
        peerWithRoom.close();
        return;
      }

      const parsedUrl = new URL(url);
      const roomId = parsedUrl.searchParams.get('room');

      if (!roomId) {
        console.error('ID da sala não especificado na URL');
        peerWithRoom.close();
        return;
      }

      const userId = peerWithRoom.id;
      peerWithRoom.room = roomId;

      peerWithRoom.subscribe(roomId);

      if (!DB[roomId]) {
        const game: IGame = {
          players: {},
          lastPlayerId: 0,
          board: generateBoard(BOARD_SIZE)
        }
        game.players[userId] = generatePlayer(game.lastPlayerId)
        DB[roomId] = game;
        DB[roomId].lastPlayerId += 1
      } else {
        DB[roomId].players[userId] = generatePlayer(DB[roomId].lastPlayerId)
        DB[roomId].lastPlayerId += 1
      }

      console.log(`Peer conectado à sala: ${roomId}`);

      const responseYourPlayer: IWebsocketResponse = {
        type: TypeResponseEnum.YOUR_PLAYER,
        userId: userId,
        data: DB[roomId].players[userId],
      };

      const responseNewPlayer: IWebsocketResponse = {
        type: TypeResponseEnum.NEW_PLAYER,
        userId: userId,
        data: DB[roomId].players[userId],
      };

      const responseGameInfo: IWebsocketResponse = {
        type: TypeResponseEnum.GAME_INFO,
        data: DB[roomId],
      };

      // Envia a mensagem de volta para o peer que enviou
      peerWithRoom.send(JSON.stringify(responseGameInfo));

      // Envia a mensagem para todos os peers na sala
      peerWithRoom.publish(peerWithRoom.room, JSON.stringify(responseNewPlayer));

      // Envia a mensagem de volta para o peer que enviou
      peerWithRoom.send(JSON.stringify(responseYourPlayer));
    } catch (error) {
      console.error('Erro ao processar conexão:', error);
      peer.close();
    }
  },

  close(peer) {
    const userId = peer.id;

    const roomId = (peer as PeerWithRoom)?.room;
    if (!roomId) {
      console.error('Nenhuma sala associada a este peer');
      return;
    } else if (!DB[roomId]) {
      console.error('Sala não encontrada');
      return;
    }

    delete DB[roomId].players[userId];
    const responseRemovePlayer: IWebsocketResponse = {
      type: TypeResponseEnum.REMOVE_PLAYER,
      userId: userId
    };

    // Envia a mensagem para todos os peers na sala
    peer.publish(roomId, JSON.stringify(responseRemovePlayer));

    console.log(`Conexão fechada (Peer ID: ${userId})`);
  },

  error(peer, error) {
    const userId = peer.id;

    console.error(`Erro no peer (ID: ${userId}):`, error);
  },

  message(peer, message) {
    try {
      const peerWithRoom = peer as PeerWithRoom;
      const roomId = peerWithRoom?.room;
      const userId = peerWithRoom?.id;

      if (!roomId) {
        console.error('Nenhuma sala associada a este peer');
        peerWithRoom.close();
        return;
      }

      const messageText = message.text() as ActionMoveEnum;
      console.log(`Mensagem recebida: ${messageText}`);

      const player = DB[roomId].players[userId];
      const board = DB[roomId].board;

      if (!player) {
        console.error('Jogador não encontrado');
        peerWithRoom.close();
        return;
      } else if (!board) {
        console.error('Tabuleiro não encontrado');
        peerWithRoom.close();
        return;
      }

      if (!player.movementTimeout) {
        player.movementTimeout = new Date().getTime()
      } else if (new Date().getTime() - player.movementTimeout < 500) {
        const responseInvalidAction: IWebsocketResponse = {
          type: TypeResponseEnum.INVALID_ACTION,
          userId: userId,
          message: 'Aguarde um pouco antes de se mover novamente'
        };

        // Envia a mensagem de volta para o peer que enviou
        peerWithRoom.send(JSON.stringify(responseInvalidAction));

        return
      } else {
        player.movementTimeout = new Date().getTime()
      }

      let pointsGetted = 0

      if ([ActionMoveEnum.LEFT, ActionMoveEnum.RIGHT, ActionMoveEnum.TOP, ActionMoveEnum.DOWN].includes(messageText)) {
        const adjacentBlock = getAdjacentBlock(board, player.position.x, player.position.y, messageText)

        if (!adjacentBlock.block.isBlocked) {
          if (adjacentBlock.block.points) {
            player.points += adjacentBlock.block.points
            pointsGetted = adjacentBlock.block.points
            adjacentBlock.block.points = 0
          }

          player.direction = messageText
          player.position.x = adjacentBlock.x
          player.position.y = adjacentBlock.y
        }

        player.iteractions += 1
      }

      const interactionGetPoints: IInteractionGetPoints = {
        points: pointsGetted,
        type: TypeInteractionEnum.GET_POINTS
      }

      const response: IWebsocketResponse = {
        type: TypeResponseEnum.MOVE_PLAYER,
        userId: userId,
        direction: messageText,
        interaction: pointsGetted ? interactionGetPoints : undefined,
        data: player,
      };

      // Envia a mensagem para todos os peers na sala
      peerWithRoom.publish(roomId, JSON.stringify(response));

      // Envia a mensagem de volta para o peer que enviou
      peerWithRoom.send(JSON.stringify(response));

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  },
});
