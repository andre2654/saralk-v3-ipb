import type { TypeResponseEnum, TypeInteractionEnum } from '@/enums/websocket';
import type { ActionMoveEnum } from '@/enums/actions';
import type { IGame, IPlayer } from '@/types/game';

export interface IInteractionGetPoints {
  type: TypeInteractionEnum.GET_POINTS;
  points: number;
}

export interface IWebsocketResponseNewPlayer {
  type: TypeResponseEnum.NEW_PLAYER;
  userId: string;
  data: IPlayer;
}

export interface IWebsocketResponseYourPlayer {
  type: TypeResponseEnum.YOUR_PLAYER;
  userId: string;
  data: IPlayer;
}

export interface IWebsocketResponseGameInfo {
  type: TypeResponseEnum.GAME_INFO;
  data: IGame;
}

export interface IWebsocketResponseMovePlayer {
  type: TypeResponseEnum.MOVE_PLAYER;
  userId: string;
  direction: ActionMoveEnum;
  interaction?: IInteractionGetPoints;
  data: IPlayer;
}

export interface IWebsocketResponseRemovePlayer {
  type: TypeResponseEnum.REMOVE_PLAYER;
  userId: string;
}

export interface IWebsocketResponseInvalidAction {
  type: TypeResponseEnum.INVALID_ACTION;
  userId: string;
  message: string;
}

export type IWebsocketResponse = IWebsocketResponseNewPlayer | IWebsocketResponseYourPlayer | IWebsocketResponseMovePlayer | IWebsocketResponseGameInfo | IWebsocketResponseRemovePlayer | IWebsocketResponseInvalidAction;