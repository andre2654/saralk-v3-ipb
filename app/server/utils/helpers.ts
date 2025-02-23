import { GameBlockTypeEnum, ActionMoveEnum, TypeUserEnum as TypeUserEnumValue } from '@/enums/game';
import type { IAdjacentBlocks } from '@/types/websocket';
import type { TypeUserEnum } from '@/enums/game';
import type { IBlock, IBlockHeuristic, IBoard, IPlayer, IPosition } from '@/types/game';
import { get } from 'mongoose';


export function generatePlayer(lastPlayerId: number, userName: string | null, type: TypeUserEnum, peerId: string): IPlayer {
  return {
    peerId: peerId,
    name: userName || lastPlayerId.toString(),
    type: type,
    position: {
      x: 0,
      y: 0
    },
    informed: type !== TypeUserEnumValue.SPECTATOR ? false : true,
    points: 0,
    iteractions: 0,
    direction: ActionMoveEnum.RIGHT,
    inMovement: false,
    movementTimeout: null,
    reachedGoal: false,
    inGame: true
  }
}

const randomBlockType = (): GameBlockTypeEnum => {
  const blockTypes = [
    GameBlockTypeEnum.GRASSY_1,
    GameBlockTypeEnum.GRASSY_2,
    GameBlockTypeEnum.ROCKY_1,
    GameBlockTypeEnum.ROCKY_2,
    GameBlockTypeEnum.SANDY_1,
    GameBlockTypeEnum.SANDY_2,
    GameBlockTypeEnum.SWAMPY_1,
    GameBlockTypeEnum.SWAMPY_2
  ]

  return blockTypes[Math.floor(Math.random() * blockTypes.length)];
}

const getCostByBlockType = (block: GameBlockTypeEnum): number => {
  switch (block) {
    case GameBlockTypeEnum.GRASSY_1:
      return 1;
    case GameBlockTypeEnum.GRASSY_2:
      return 1;
    case GameBlockTypeEnum.ROCKY_1:
      return 2;
    case GameBlockTypeEnum.ROCKY_2:
      return 2;
    case GameBlockTypeEnum.SANDY_1:
      return 3;
    case GameBlockTypeEnum.SANDY_2:
      return 3;
    case GameBlockTypeEnum.SWAMPY_1:
      return 4;
    case GameBlockTypeEnum.SWAMPY_2:
      return 4;
    case GameBlockTypeEnum.GOAL:
      return 0;
    default:
      return 1;
  }
}

function generateBlock(x: number, y: number): IBlock {
  // possibility of generating a blocked block is 3%
  const isBlocked = Math.random() < 0.03;

  // points are generated randomly between 10, 20, 30 and 50
  // the probability of generating any of these values is 5%
  const points = Math.random() < 0.05 ? [10, 20, 30, 50][Math.floor(Math.random() * 4)] : 0;

  const blockType = randomBlockType();

  return {
    type: blockType,
    isBlocked: isBlocked,
    points: !isBlocked ? points : 0,
    position: { x, y }
  }
}

export function calculateDistanceHeuristicOfGoal(block: IBlock, goalBlock: IBlock, board: IBoard): IBlockHeuristic {
  // Keep vars
  let costAtBlock = getCostByBlockType(block.type);
  let costAtGoal = 0;
  let curX = block.position.x;
  let curY = block.position.y;

  // Calculate path cost from current block to goal
  let stepX = curX < goalBlock.position.x ? 1 : -1;
  let stepY = curY < goalBlock.position.y ? 1 : -1;

  // X movement cost
  for (let i = curX; i !== goalBlock.position.x; i += stepX) {
    if (i < 0 || i >= board[0].length) break; // Proteção de índice
    costAtGoal += getCostByBlockType(board[curY][i].type);
  }

  // Y movement cost
  for (let i = curY; i !== goalBlock.position.y; i += stepY) {
    if (i < 0 || i >= board.length) break; // Proteção de índice
    costAtGoal += getCostByBlockType(board[i][curX].type);
  }

  // Se o bloco for bloqueado, retorna custo muito alto
  if (block.isBlocked) {
    return {
      cost: 999,
      distanceAtGoal: costAtGoal,
    };
  }

  return {
    cost: costAtBlock,
    distanceAtGoal: costAtGoal,
  };
}

export function generateBoard(size: number): IBoard {
  const board: IBoard = [];

  for (let y = 0; y < size; y++) {
    const row: IBlock[] = [];

    for (let x = 0; x < size; x++) {
      row.push(generateBlock(x, y));
    }

    board.push(row);
  }

  // the initial block is never blocked
  board[0][0].isBlocked = false;

  // Randomly select a block to be the goal (must be the lasts rows)
  const goalX = Math.floor(Math.random() * size);
  const goalY = Math.floor(Math.random() * (size - (size / 2)) + size / 2);

  board[goalY][goalX].type = GameBlockTypeEnum.GOAL;
  board[goalY][goalX].isBlocked = false;

  // Calculate the distance from the goal to each block
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      board[y][x].heuristic = calculateDistanceHeuristicOfGoal(board[y][x], board[goalY][goalX], board);
    }
  }

  return board;
}

export function getAdjacentBlocks(board: IBoard, player: IPlayer): IAdjacentBlocks {
  const offsets = {} as {
    [key in ActionMoveEnum]: IPosition;
  };

  offsets[ActionMoveEnum.LEFT] = { x: -1, y: 0 };
  offsets[ActionMoveEnum.RIGHT] = { x: 1, y: 0 };
  offsets[ActionMoveEnum.TOP] = { x: 0, y: -1 };
  offsets[ActionMoveEnum.DOWN] = { x: 0, y: 1 };

  const adjacentBlocks: IAdjacentBlocks = {};

  for (const direction in offsets) {
    const offset: IPosition = offsets[direction as keyof typeof offsets];
    const x = player.position.x + offset.x;
    const y = player.position.y + offset.y;

    if (x < 0 || x >= board.length || y < 0 || y >= board.length) {
      continue;
    }

    const block = board[y][x];
    if (!player.informed) {
      delete block.heuristic;
    }

    adjacentBlocks[direction as ActionMoveEnum] = block;
  }

  return adjacentBlocks;
}