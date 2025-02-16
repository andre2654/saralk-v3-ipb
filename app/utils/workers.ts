import type { IWebsocketResponse, IAdjacentBlocks } from '@/types/websocket';
import { TypeUserEnum } from '@/enums/game';
import { TypeResponseEnum } from '@/enums/websocket';
import { ActionMoveEnum } from '@/enums/game';
import { useWebSocket } from '@vueuse/core';
import type { IBlock, IPosition } from '@/types/game';

interface IBlockAndAdjacentBlocks {
  block: IBlock;
  adjacentBlocks: IAdjacentBlocks;
}

// Conexão WebSocket
const host = window.location.host;
const connection_url = `ws://${host}/api/websocket?userType=${TypeUserEnum.PLAYER}`;

// ------------------------------------------------------------------
// Algoritmo BFS (Busca em Largura)
// ------------------------------------------------------------------
export async function breadthFirstSearchWorker(roomId: string) {
  const { data, send, close } = useWebSocket(`${connection_url}&room=${roomId}&userName=bfs`);

  let workerId = '';

  // visited[y][x] = { block, adjacentBlocks }
  const visited: Record<number, Record<number, IBlockAndAdjacentBlocks>> = {};

  // Fila BFS de posições
  const queue: IPosition[] = [];
  const currentPosition: IPosition = { x: 0, y: 0 };

  // ------------------------------------------------------------------
  // Enfileirar um bloco se não estiver bloqueado nem visitado.
  // ------------------------------------------------------------------
  function enqueue(block: IBlock | undefined) {
    if (!block) return;
    if (block.isBlocked) return;

    const { x, y } = block.position;
    if (visited[y]?.[x]) {
      // já visitado
      return;
    }

    // Se não está visitado ainda, coloca na fila
    queue.push({ x, y });
  }

  // ------------------------------------------------------------------
  // "Visitar" um bloco: salvá-lo em visited[y][x].
  // ------------------------------------------------------------------
  function visit(blockAndAdjacents: IBlockAndAdjacentBlocks) {
    const { x, y } = blockAndAdjacents.block.position;
    if (!visited[y]) {
      visited[y] = {};
    }
    visited[y][x] = blockAndAdjacents;
  }

  // ------------------------------------------------------------------
  // findBestMoveTo: tenta andar em linha reta (sem contornar obstáculos).
  // ------------------------------------------------------------------
  function findBestMoveTo(targetPos: IPosition, adjacentBlocks: IAdjacentBlocks): ActionMoveEnum {
    // Descobrir a diferença em x e y
    const dx = targetPos.x - currentPosition.x;
    const dy = targetPos.y - currentPosition.y;

    // Se já estamos no alvo
    if (dx === 0 && dy === 0) {
      return ActionMoveEnum.MOVEMENT_NOT_FOUND;
    }

    // Testa direções por prioridade: vertical primeiro, depois horizontal
    if (dy < 0 && adjacentBlocks[ActionMoveEnum.TOP] && !adjacentBlocks[ActionMoveEnum.TOP].isBlocked) {
      return ActionMoveEnum.TOP;
    }
    if (dy > 0 && adjacentBlocks[ActionMoveEnum.DOWN] && !adjacentBlocks[ActionMoveEnum.DOWN].isBlocked) {
      return ActionMoveEnum.DOWN;
    }
    if (dx < 0 && adjacentBlocks[ActionMoveEnum.LEFT] && !adjacentBlocks[ActionMoveEnum.LEFT].isBlocked) {
      return ActionMoveEnum.LEFT;
    }
    if (dx > 0 && adjacentBlocks[ActionMoveEnum.RIGHT] && !adjacentBlocks[ActionMoveEnum.RIGHT].isBlocked) {
      return ActionMoveEnum.RIGHT;
    }

    return ActionMoveEnum.MOVEMENT_NOT_FOUND;
  }

  // ------------------------------------------------------------------
  // consumeNextQueue: pega o primeiro alvo da fila e tenta achar o melhor passo.
  // Se não encontrar, descarta e tenta o próximo.
  // ------------------------------------------------------------------
  function consumeNextQueue(adjacentBlocks: IAdjacentBlocks): ActionMoveEnum | undefined {
    const position = queue[0];
    if (!position) return;

    const bestMove = findBestMoveTo(position, adjacentBlocks);

    if (bestMove === ActionMoveEnum.MOVEMENT_NOT_FOUND) {
      queue.shift(); // remove esse destino
      return consumeNextQueue(adjacentBlocks);
    }

    return bestMove;
  }

  // ------------------------------------------------------------------
  // WebSocket 'data' watch
  // ------------------------------------------------------------------
  watch(data, async (value) => {
    await new Promise(resolve => setTimeout(resolve, 400));

    if (!value) return;

    const response: IWebsocketResponse = JSON.parse(value);
    const type = response.type;

    switch (type) {
      case TypeResponseEnum.NEW_PLAYER:
        console.log('NEW_PLAYER');
        break;

      case TypeResponseEnum.YOUR_PLAYER: {
        console.log('YOUR_PLAYER', response);
        workerId = response.userId;

        const adjacentBlocks = response.adjacentBlocks;
        const currentBlock = response.currentBlock;

        currentPosition.x = currentBlock.position.x;
        currentPosition.y = currentBlock.position.y;

        // visit + enfileirar
        visit({ block: currentBlock, adjacentBlocks });
        for (const dir of [ActionMoveEnum.TOP, ActionMoveEnum.LEFT, ActionMoveEnum.DOWN, ActionMoveEnum.RIGHT]) {
          enqueue(adjacentBlocks[dir]);
        }

        const bestMove = consumeNextQueue(adjacentBlocks);

        if (bestMove === ActionMoveEnum.MOVEMENT_NOT_FOUND || !bestMove) {
          console.log('Movimento não encontrado. Encerrando...');
          close();
          return;
        } else {
          send(bestMove);
        }
        break;
      }

      case TypeResponseEnum.GAME_INFO:
        console.log('GAME_INFO');
        break;

      case TypeResponseEnum.MOVE_PLAYER: {
        console.log('MOVE_PLAYER', response);

        const person = response.data;
        if (person.reachedGoal) {
          close();
          return;
        }

        const adjacentBlocks = response.adjacentBlocks;
        const currentBlock = response.currentBlock;

        currentPosition.x = currentBlock.position.x;
        currentPosition.y = currentBlock.position.y;

        visit({ block: currentBlock, adjacentBlocks });
        for (const dir of [ActionMoveEnum.TOP, ActionMoveEnum.LEFT, ActionMoveEnum.DOWN, ActionMoveEnum.RIGHT]) {
          enqueue(adjacentBlocks[dir]);
        }

        const bestMove = consumeNextQueue(adjacentBlocks);

        if (bestMove === ActionMoveEnum.MOVEMENT_NOT_FOUND || !bestMove) {
          console.log('Movimento não encontrado. Encerrando...');
          close();
          return;
        } else {
          send(bestMove);
        }
        break;
      }

      case TypeResponseEnum.REMOVE_PLAYER:
        console.log('REMOVE_PLAYER');
        break;

      case TypeResponseEnum.BOARD_INFO:
        console.log('BOARD_INFO');
        break;

      case TypeResponseEnum.INVALID_ACTION:
        console.log(response.message);
        break;
    }
  });
}

// ------------------------------------------------------------------
// Algoritmo DFS (Busca em Profundidade)
// ------------------------------------------------------------------
export async function depthFirstSearchWorker(roomId: string) {
  const { data, send, close } = useWebSocket(`${connection_url}&room=${roomId}&userName=dfs`);

  let workerId = '';

  // visited[y][x] = { block, adjacentBlocks }
  const visited: Record<number, Record<number, IBlockAndAdjacentBlocks>> = {};

  // Fila DFS de posições
  const queue: IPosition[] = [];
  const currentPosition: IPosition = { x: 0, y: 0 };

  // ------------------------------------------------------------------
  // Enfileirar um bloco se não estiver bloqueado nem visitado.
  // ------------------------------------------------------------------
  function enqueue(block: IBlock | undefined) {
    if (!block) return;
    if (block.isBlocked) return;

    const { x, y } = block.position;
    if (visited[y]?.[x]) {
      // já visitado
      return;
    }

    // Se não está visitado ainda, coloca na fila em ordem inversa
    queue.unshift({ x, y });
  }

  // ------------------------------------------------------------------
  // "Visitar" um bloco: salvá-lo em visited[y][x].
  // ------------------------------------------------------------------
  function visit(blockAndAdjacents: IBlockAndAdjacentBlocks) {
    const { x, y } = blockAndAdjacents.block.position;
    if (!visited[y]) {
      visited[y] = {};
    }
    visited[y][x] = blockAndAdjacents;
  }

  // ------------------------------------------------------------------
  // findBestMoveTo: tenta andar em linha reta (sem contornar obstáculos).
  // ------------------------------------------------------------------
  function findBestMoveTo(targetPos: IPosition, adjacentBlocks: IAdjacentBlocks): ActionMoveEnum {
    // Descobrir a diferença em x e y
    const dx = targetPos.x - currentPosition.x;
    const dy = targetPos.y - currentPosition.y;

    // Se já estamos no alvo
    if (dx === 0 && dy === 0) {
      return ActionMoveEnum.MOVEMENT_NOT_FOUND;
    }

    // Testa direções por prioridade: vertical primeiro, depois horizontal
    if (dy < 0 && adjacentBlocks[ActionMoveEnum.TOP] && !adjacentBlocks[ActionMoveEnum.TOP].isBlocked) {
      return ActionMoveEnum.TOP;
    }
    if (dy > 0 && adjacentBlocks[ActionMoveEnum.DOWN] && !adjacentBlocks[ActionMoveEnum.DOWN].isBlocked) {
      return ActionMoveEnum.DOWN;
    }
    if (dx < 0 && adjacentBlocks[ActionMoveEnum.LEFT] && !adjacentBlocks[ActionMoveEnum.LEFT].isBlocked) {
      return ActionMoveEnum.LEFT;
    }
    if (dx > 0 && adjacentBlocks[ActionMoveEnum.RIGHT] && !adjacentBlocks[ActionMoveEnum.RIGHT].isBlocked) {
      return ActionMoveEnum.RIGHT;
    }

    return ActionMoveEnum.MOVEMENT_NOT_FOUND;
  }

  // ------------------------------------------------------------------
  // consumeNextQueue: pega o primeiro alvo da fila e tenta achar o melhor passo.
  // Se não encontrar, descarta e tenta o próximo.
  // ------------------------------------------------------------------
  function consumeNextQueue(adjacentBlocks: IAdjacentBlocks): ActionMoveEnum | undefined {
    const position = queue[0];
    if (!position) return;

    const bestMove = findBestMoveTo(position, adjacentBlocks);

    if (bestMove === ActionMoveEnum.MOVEMENT_NOT_FOUND) {
      queue.shift(); // remove esse destino
      return consumeNextQueue(adjacentBlocks);
    }

    return bestMove;
  }

  // ------------------------------------------------------------------
  // WebSocket 'data' watch
  // ------------------------------------------------------------------
  watch(data, async (value) => {
    await new Promise(resolve => setTimeout(resolve, 400));

    if (!value) return;

    const response: IWebsocketResponse = JSON.parse(value);
    const type = response.type;

    switch (type) {
      case TypeResponseEnum.NEW_PLAYER:
        console.log('NEW_PLAYER');
        break;

      case TypeResponseEnum.YOUR_PLAYER: {
        console.log('YOUR_PLAYER', response);
        workerId = response.userId;

        const adjacentBlocks = response.adjacentBlocks;
        const currentBlock = response.currentBlock;

        currentPosition.x = currentBlock.position.x;
        currentPosition.y = currentBlock.position.y;

        // visit + enfileirar
        visit({ block: currentBlock, adjacentBlocks });
        for (const dir of [ActionMoveEnum.TOP, ActionMoveEnum.LEFT, ActionMoveEnum.DOWN, ActionMoveEnum.RIGHT]) {
          enqueue(adjacentBlocks[dir]);
        }

        const bestMove = consumeNextQueue(adjacentBlocks);

        if (bestMove === ActionMoveEnum.MOVEMENT_NOT_FOUND || !bestMove) {
          console.log('Movimento não encontrado. Encerrando...');
          close();
          return;
        } else {
          send(bestMove);
        }
        break;
      }

      case TypeResponseEnum.GAME_INFO:
        console.log('GAME_INFO');
        break;

      case TypeResponseEnum.MOVE_PLAYER: {
        console.log('MOVE_PLAYER', response);

        const person = response.data;
        if (person.reachedGoal) {
          close();
          return;
        }

        const adjacentBlocks = response.adjacentBlocks;
        const currentBlock = response.currentBlock;

        currentPosition.x = currentBlock.position.x;
        currentPosition.y = currentBlock.position.y;

        visit({ block: currentBlock, adjacentBlocks });
        for (const dir of [ActionMoveEnum.TOP, ActionMoveEnum.LEFT, ActionMoveEnum.DOWN, ActionMoveEnum.RIGHT]) {
          enqueue(adjacentBlocks[dir]);
        }

        const bestMove = consumeNextQueue(adjacentBlocks);

        if (bestMove === ActionMoveEnum.MOVEMENT_NOT_FOUND || !bestMove) {
          console.log('Movimento não encontrado. Encerrando...');
          close();
          return;
        } else {
          send(bestMove);
        }
        break;
      }

      case TypeResponseEnum.REMOVE_PLAYER:
        console.log('REMOVE_PLAYER');
        break;

      case TypeResponseEnum.BOARD_INFO:
        console.log('BOARD_INFO');
        break;

      case TypeResponseEnum.INVALID_ACTION:
        console.log(response.message);
        break;
    }
  });
}
