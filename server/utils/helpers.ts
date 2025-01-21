import { GameBlockTypeEnum } from '@/enums/game';
import { ActionMoveEnum } from '@/enums/actions';
import type { IBlock, IBoard, IPlayer } from '@/types/game';

export function generatePlayer(): IPlayer {
  return {
    position: {
      x: 0,
      y: 0
    },
    points: 0,
    iteractions: 0,
    direction: ActionMoveEnum.RIGHT,
    inMovement: false,
    movementTimeout: null
  }
}

const randomBlockType = (): GameBlockTypeEnum => {
  const keys = Object.keys(GameBlockTypeEnum);
  const randomBlockType: number = Math.floor(Math.random() * keys.length);
  return GameBlockTypeEnum[keys[randomBlockType]];
}

function generateBlock(): IBlock {
  // possibility of generating a blocked block is 5%
  const isBlocked = Math.random() < 0.05;

  // points are generated randomly between 10, 20, 30 and 50
  // the probability of generating any of these values is 5%
  const points = Math.random() < 0.05 ? [10, 20, 30, 50][Math.floor(Math.random() * 4)] : 0;

  return {
    type: randomBlockType(),
    isBlocked: isBlocked,
    points: !isBlocked ? points : 0
  }
}

export function generateBoard(size: number): IBoard {
  const board: IBoard = [];

  for (let i = 0; i < size; i++) {
    const row: IBlock[] = [];

    for (let j = 0; j < size; j++) {
      row.push(generateBlock());
    }

    board.push(row);
  }

  return board;
}

export function getAdjacentBlock(board: IBoard, x: number, y: number, direction: ActionMoveEnum): { block: IBlock, x: number, y: number } {
  const offsets = {
    [ActionMoveEnum.LEFT]: { dx: -1, dy: 0 },
    [ActionMoveEnum.RIGHT]: { dx: 1, dy: 0 },
    [ActionMoveEnum.TOP]: { dx: 0, dy: -1 },
    [ActionMoveEnum.DOWN]: { dx: 0, dy: 1 },
  };

  const { dx, dy } = offsets[direction];
  const maxX = board[0].length - 1;
  const maxY = board.length - 1;

  let newX = x + dx;
  let newY = y + dy;

  if (newX < 0) {
    newX = 0;
  } else if (newX > maxX) {
    newX = maxX;
  }

  if (newY < 0) {
    newY = 0;
  } else if (newY > maxY) {
    newY = maxY;
  }

  return {
    block: board[newY][newX],
    x: newX,
    y: newY
  };
}