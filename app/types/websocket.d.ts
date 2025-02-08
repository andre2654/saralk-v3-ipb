import type { TypeResponseEnum } from '@/enums/websocket';
import type { ActionMoveEnum } from '@/enums/game';
import type { IGame, IPlayer, IBoard, IPosition, IBlock } from '@/types/game';

export interface IAdjacentBlocks {
  [ActionMoveEnum.TOP]?: IBlock;
  [ActionMoveEnum.LEFT]?: IBlock;
  [ActionMoveEnum.DOWN]?: IBlock;
  [ActionMoveEnum.RIGHT]?: IBlock;
}

export interface IInteractionGetPoints {
  points: number;
  position: IPosition;
}

export interface IInteractionReachedGoal {
  position: IPosition;
}

export interface IInteractions {
  [key: string]: IInteractionGetPoints | IInteractionReachedGoal;
};

export interface IWebsocketResponseNewPlayer {
  type: TypeResponseEnum.NEW_PLAYER;
  userId: string;
  data: IPlayer;
}

export interface IWebsocketResponseYourPlayer {
  type: TypeResponseEnum.YOUR_PLAYER;
  userId: string;
  data: IPlayer;
  adjacentBlocks: IAdjacentBlocks;
}

export interface IWebsocketResponseGameInfo {
  type: TypeResponseEnum.GAME_INFO;
  data: IGame;
}

export interface IWebsocketResponseMovePlayer {
  type: TypeResponseEnum.MOVE_PLAYER;
  userId: string;
  direction: ActionMoveEnum;
  interactions: IInteractions;
  data: IPlayer;
  adjacentBlocks: IAdjacentBlocks;
}

export interface IWebsocketResponseRemovePlayer {
  type: TypeResponseEnum.REMOVE_PLAYER;
  userId: string;
}

export interface IWebsocketResponseBoardInfo {
  type: TypeResponseEnum.BOARD_INFO;
  board: IBoard;
  userId: string;
}

export interface IWebsocketResponseInvalidAction {
  type: TypeResponseEnum.INVALID_ACTION;
  userId: string;
  message: string;
}

export type IWebsocketResponse = IWebsocketResponseNewPlayer | IWebsocketResponseYourPlayer | IWebsocketResponseMovePlayer | IWebsocketResponseGameInfo | IWebsocketResponseRemovePlayer |
  IWebsocketResponseBoardInfo | IWebsocketResponseInvalidAction;