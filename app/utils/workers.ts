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
const connection_url = `wss://${host}/api/websocket?userType=${TypeUserEnum.BOT}`;
const WORKERS_DELAY = 1200;

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
    await new Promise(resolve => setTimeout(resolve, WORKERS_DELAY));

    if (!value) return;

    const response: IWebsocketResponse = JSON.parse(value);
    const type = response.type;

    switch (type) {
      case TypeResponseEnum.NEW_PLAYER:
        // console.log('NEW_PLAYER');
        break;

      case TypeResponseEnum.YOUR_PLAYER: {
        // console.log('YOUR_PLAYER', response);
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
          // console.log('Movimento não encontrado. Encerrando...');
          close();
          return;
        } else {
          send(bestMove);
        }
        break;
      }

      case TypeResponseEnum.GAME_INFO:
        // console.log('GAME_INFO');
        break;

      case TypeResponseEnum.MOVE_PLAYER: {
        // console.log('MOVE_PLAYER', response);

        if (response.userId !== workerId) return;

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
          // console.log('Movimento não encontrado. Encerrando...');
          close();
          return;
        } else {
          send(bestMove);
        }
        break;
      }

      case TypeResponseEnum.REMOVE_PLAYER:
        // console.log('REMOVE_PLAYER');
        break;

      case TypeResponseEnum.BOARD_INFO:
        // console.log('BOARD_INFO');
        break;

      case TypeResponseEnum.INVALID_ACTION:
        // console.log(response.message);
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
    await new Promise(resolve => setTimeout(resolve, WORKERS_DELAY));

    if (!value) return;

    const response: IWebsocketResponse = JSON.parse(value);
    const type = response.type;

    switch (type) {
      case TypeResponseEnum.NEW_PLAYER:
        // console.log('NEW_PLAYER');
        break;

      case TypeResponseEnum.YOUR_PLAYER: {
        // console.log('YOUR_PLAYER', response);
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
          // console.log('Movimento não encontrado. Encerrando...');
          close();
          return;
        } else {
          send(bestMove);
        }
        break;
      }

      case TypeResponseEnum.GAME_INFO:
        // console.log('GAME_INFO');
        break;

      case TypeResponseEnum.MOVE_PLAYER: {
        // console.log('MOVE_PLAYER', response);

        if (response.userId !== workerId) return;

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
          // console.log('Movimento não encontrado. Encerrando...');
          close();
          return;
        } else {
          send(bestMove);
        }
        break;
      }

      case TypeResponseEnum.REMOVE_PLAYER:
        // console.log('REMOVE_PLAYER');
        break;

      case TypeResponseEnum.BOARD_INFO:
        // console.log('BOARD_INFO');
        break;

      case TypeResponseEnum.INVALID_ACTION:
        // console.log(response.message);
        break;
    }
  });
}

// ------------------------------------------------------------------
// Algoritmo Greedy (Guloso)
// ------------------------------------------------------------------
export async function greedyWorker(roomId: string) {
  const { data, send, close } = useWebSocket(`${connection_url}&room=${roomId}&userName=gs`);

  let workerId = '';

  // visited[y][x] = { block, adjacentBlocks }
  const visited: Record<number, Record<number, IBlockAndAdjacentBlocks>> = {};

  // Fila GS de posições
  const currentPosition: IPosition = { x: 0, y: 0 };

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
  function findBestMoveTo(adjacentBlocks: IAdjacentBlocks): ActionMoveEnum {
    let bestDistance = Infinity;
    let bestMove = ActionMoveEnum.MOVEMENT_NOT_FOUND;

    for (const move of [ActionMoveEnum.TOP, ActionMoveEnum.DOWN, ActionMoveEnum.LEFT, ActionMoveEnum.RIGHT]) {
      const block = adjacentBlocks[move];
      if (!block || block.isBlocked) continue;
      if (visited[block.position.y]?.[block.position.x]) continue;

      // Agora minimizamos a distância ao objetivo
      if (block.heuristic.distanceAtGoal < bestDistance) {
        bestDistance = block.heuristic.distanceAtGoal;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // ------------------------------------------------------------------
  // WebSocket 'data' watch
  // ------------------------------------------------------------------
  watch(data, async (value) => {
    await new Promise(resolve => setTimeout(resolve, WORKERS_DELAY));

    if (!value) return;

    const response: IWebsocketResponse = JSON.parse(value);
    const type = response.type;

    switch (type) {
      case TypeResponseEnum.NEW_PLAYER:
        // console.log('NEW_PLAYER');
        break;

      case TypeResponseEnum.YOUR_PLAYER: {
        // console.log('YOUR_PLAYER', response);
        workerId = response.userId;

        send(ActionMoveEnum.GET_BOARD_INFO);

        break;
      }

      case TypeResponseEnum.GAME_INFO:
        // console.log('GAME_INFO');
        break;

      case TypeResponseEnum.MOVE_PLAYER: {
        // console.log('MOVE_PLAYER', response);

        if (response.userId !== workerId) return;

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

        // console.log(adjacentBlocks)

        const bestMove = findBestMoveTo(adjacentBlocks);

        if (bestMove === ActionMoveEnum.MOVEMENT_NOT_FOUND || !bestMove) {
          // console.log('Movimento não encontrado. Encerrando...');
          close();
          return;
        } else {
          send(bestMove);
        }
        break;
      }

      case TypeResponseEnum.REMOVE_PLAYER:
        // console.log('REMOVE_PLAYER');
        break;

      case TypeResponseEnum.BOARD_INFO:
        // console.log('BOARD_INFO');

        send(ActionMoveEnum.TOP);

        break;

      case TypeResponseEnum.INVALID_ACTION:
        // console.log(response.message);
        break;
    }
  });
}

// ------------------------------------------------------------------
// Algoritmo A-star (A*)
// ------------------------------------------------------------------
export async function aStarWorker(roomId: string) {
  const { data, send, close } = useWebSocket(`${connection_url}&room=${roomId}&userName=a*`);

  let workerId = '';

  // visited[y][x] = { block, adjacentBlocks }
  const visited: Record<number, Record<number, IBlockAndAdjacentBlocks>> = {};

  // Fila A* de posições
  const gCost: Record<number, Record<number, number>> = {};
  const currentPosition: IPosition = { x: 0, y: 0 };

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
  function findBestMoveTo(currentBlock: IBlock, adjacentBlocks: IAdjacentBlocks): ActionMoveEnum {
    let bestF = Infinity;
    let bestMove = ActionMoveEnum.MOVEMENT_NOT_FOUND;

    for (const move of [ActionMoveEnum.TOP, ActionMoveEnum.DOWN, ActionMoveEnum.LEFT, ActionMoveEnum.RIGHT]) {
      const block = adjacentBlocks[move];
      if (!block || block.isBlocked) continue;
      if (visited[block.position.y]?.[block.position.x]) continue;

      // Cálculo do custo acumulado g(x)
      const newGCost = (gCost[currentBlock.position.y]?.[currentBlock.position.x] || 0) + block.heuristic.cost;

      // Atualiza o custo g(x) se for menor que o anterior
      if (!gCost[block.position.y]) gCost[block.position.y] = {};
      if (!gCost[block.position.y][block.position.x] || newGCost < gCost[block.position.y][block.position.x]) {
        gCost[block.position.y][block.position.x] = newGCost;
      }

      // Cálculo do f(x) = g(x) + h(x)
      const fCost = newGCost + block.heuristic.distanceAtGoal;

      if (fCost < bestF) {
        bestF = fCost;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // ------------------------------------------------------------------
  // WebSocket 'data' watch
  // ------------------------------------------------------------------
  watch(data, async (value) => {
    await new Promise(resolve => setTimeout(resolve, WORKERS_DELAY));

    if (!value) return;

    const response: IWebsocketResponse = JSON.parse(value);
    const type = response.type;

    switch (type) {
      case TypeResponseEnum.NEW_PLAYER:
        // console.log('NEW_PLAYER');
        break;

      case TypeResponseEnum.YOUR_PLAYER: {
        // console.log('YOUR_PLAYER', response);
        workerId = response.userId;

        send(ActionMoveEnum.GET_BOARD_INFO);

        break;
      }

      case TypeResponseEnum.GAME_INFO:
        // console.log('GAME_INFO');
        break;

      case TypeResponseEnum.MOVE_PLAYER: {
        // console.log('MOVE_PLAYER', response);

        if (response.userId !== workerId) return;

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

        // console.log(adjacentBlocks)

        const bestMove = findBestMoveTo(currentBlock, adjacentBlocks);

        if (bestMove === ActionMoveEnum.MOVEMENT_NOT_FOUND || !bestMove) {
          // console.log('Movimento não encontrado. Encerrando...');
          close();
          return;
        } else {
          send(bestMove);
        }
        break;
      }

      case TypeResponseEnum.REMOVE_PLAYER:
        // console.log('REMOVE_PLAYER');
        break;

      case TypeResponseEnum.BOARD_INFO:
        // console.log('BOARD_INFO');

        send(ActionMoveEnum.TOP);

        break;

      case TypeResponseEnum.INVALID_ACTION:
        // console.log(response.message);
        break;
    }
  });
}