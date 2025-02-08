import type { GameBlockTypeEnum, TypeUserEnum } from '@/enums/game';

export interface IPosition {
  x: number;
  y: number;
}

export interface IPlayer {
  name: string;
  type: TypeUserEnum;
  position: IPosition;
  informed: boolean;
  points: number;
  iteractions: number;
  direction: ActionMoveEnum;
  inMovement: boolean;
  movementTimeout: number | null;
  reachedGoal: boolean;
}

export interface IBlock {
  type: GameBlockTypeEnum;
  isBlocked: boolean;
  points: number;
  position: IPosition;
}

export type IBoard = IBlock[][];

export interface IGame {
  players: {
    [key: string]: IPlayer;
  },
  quantityPlayersEntered: number;
  board: IBoard;
}

export interface IAllGames {
  [key: string]: IGame;
}