import { GameBlockTypeEnum } from '@/enums/game';

export interface IPlayer {
  position: {
    x: number;
    y: number;
  };
  points: number;
  iteractions: number;
  direction: ActionMoveEnum
  inMovement: boolean
  movementTimeout: number | null
}

export interface IBlock {
  type: GameBlockTypeEnum;
  isBlocked: boolean;
  points: number;
}

export type IBoard = IBlock[][];

export interface IGame {
  players: {
    [key: string]: IPlayer;
  },
  board: IBoard;
}

export interface IAllGames {
  [key: string]: IGame;
}