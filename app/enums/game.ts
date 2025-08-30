export enum GameBlockTypeEnum {
  GRASSY_1 = 'grassy-1',
  GRASSY_2 = 'grassy-2',
  ROCKY_1 = 'rocky-1',
  ROCKY_2 = 'rocky-2',
  SANDY_1 = 'sandy-1',
  SANDY_2 = 'sandy-2',
  SWAMPY_1 = 'swampy-1',
  SWAMPY_2 = 'swampy-2',
  GOAL = 'goal',
}

export enum ActionMoveEnum {
  TOP = 'top',
  LEFT = 'left',
  RIGHT = 'right',
  DOWN = 'down',
  GET_BOARD_INFO = 'getBoardInfo',
  HEARTBEAT = 'heartbeat',
  MOVEMENT_NOT_FOUND = 'movement_not_found'
}

export enum TypeUserEnum {
  PLAYER = 'player',
  BOT = 'bot',
  SPECTATOR = 'spectator'
}