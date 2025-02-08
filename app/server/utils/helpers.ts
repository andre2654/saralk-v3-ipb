import { GameBlockTypeEnum, ActionMoveEnum, TypeUserEnum as TypeUserEnumValue } from '@/enums/game';
import type { IAdjacentBlocks } from '@/types/websocket';
import type { TypeUserEnum } from '@/enums/game';
import type { IBlock, IBoard, IPlayer, IPosition } from '@/types/game';


export function generatePlayer(lastPlayerId: number, userName: string | null, type: TypeUserEnum): IPlayer {
  return {
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
    reachedGoal: false
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

function generateBlock(x: number, y: number): IBlock {
  // possibility of generating a blocked block is 3%
  const isBlocked = Math.random() < 0.03;

  // points are generated randomly between 10, 20, 30 and 50
  // the probability of generating any of these values is 5%
  const points = Math.random() < 0.05 ? [10, 20, 30, 50][Math.floor(Math.random() * 4)] : 0;

  return {
    type: randomBlockType(),
    isBlocked: isBlocked,
    points: !isBlocked ? points : 0,
    position: { x, y }
  }
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

    adjacentBlocks[direction as ActionMoveEnum] = board[y][x];
  }

  return adjacentBlocks;
}