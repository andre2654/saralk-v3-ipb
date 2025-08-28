import type { GameBlockTypeEnum, TypeUserEnum } from '@/enums/game';

export interface IPosition {
  x: number;
  y: number;
}

export interface IPlayer {
  peerId?: string;
  name: string;
  type: TypeUserEnum;
  position: IPosition;
  informed: boolean;
  points: number;
  iteractions: number;
  direction: ActionMoveEnum;
  positionsHistory: IPosition[];
  inMovement: boolean;
  movementTimeout: number | null;
  reachedGoal: boolean;
  inGame: boolean;
}

export interface IBlockHeuristic {
  cost: number;
  distanceAtGoal: number;
}

export interface IBlock {
  type: GameBlockTypeEnum;
  isBlocked: boolean;
  points: number;
  position: IPosition;
  heuristic?: IBlockHeuristic
}

export type IBoard = IBlock[][];

export interface IPlayers {
  [key: string]: IPlayer;
}

export interface IGame {
  players: IPlayers,
  quantityPlayersEntered: number;
  board: IBoard;
}

export interface IAllGames {
  [key: string]: IGame;
}