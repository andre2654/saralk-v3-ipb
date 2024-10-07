import { ActionMoveEnum } from '@/enums/actions';
import { v4 as uuidv4 } from 'uuid';
import type { Peer } from 'crossws';

const validMoves = [
  ActionMoveEnum.TOP,
  ActionMoveEnum.LEFT,
  ActionMoveEnum.RIGHT,
  ActionMoveEnum.DOWN,
];

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
      const room = parsedUrl.searchParams.get('room');

      if (!room) {
        console.error('ID da sala não especificado na URL');
        peerWithRoom.close();
        return;
      }

      peerWithRoom.room = room;

      peerWithRoom.subscribe(room);
      console.log(`Peer conectado à sala: ${room}`);
    } catch (error) {
      console.error('Erro ao processar conexão:', error);
      peer.close();
    }
  },

  close(peer) {
    console.log(`Conexão fechada (Peer ID: ${peer.id})`);
  },

  error(peer, error) {
    console.error(`Erro no peer (ID: ${peer.id}):`, error);
  },

  message(peer, message) {
    try {
      const peerWithRoom = peer as PeerWithRoom;

      if (!peerWithRoom?.room) {
        console.error('Nenhuma sala associada a este peer');
        peerWithRoom.close();
        return;
      }

      const messageText = message.text() as ActionMoveEnum;

      const response = {
        uuid: uuidv4(),
        message: '',
      };

      if (validMoves.includes(messageText)) {
        response.message = messageText;
      } else {
        response.message = ActionMoveEnum.MOVEMENT_NOT_FOUND;
      }

      peerWithRoom.publish(peerWithRoom.room, JSON.stringify(response));
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  },
});
