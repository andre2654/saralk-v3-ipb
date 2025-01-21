import type { GameBlockTypeEnum } from '@/enums/game';

export interface IPlayer {
  id: number;
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
  lastPlayerId: number;
  board: IBoard;
}

export interface IAllGames {
  [key: string]: IGame;
}