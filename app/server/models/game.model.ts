import { Schema, model, Document } from 'mongoose'
import type { IGame, IPlayer, IBlock } from '@/types/game'
import { GameBlockTypeEnum, ActionMoveEnum, TypeUserEnum } from '@/enums/game'

const BlockSchema = new Schema<IBlock>({
  type: {
    type: String,
    enum: Object.values(GameBlockTypeEnum),
    required: true,
  },
  isBlocked: { type: Boolean, required: true },
  points: { type: Number, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
})

const PlayerSchema = new Schema<IPlayer>(
  {
    peerId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(TypeUserEnum), required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    informed: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    iteractions: { type: Number, default: 0 },
    direction: {
      type: String,
      enum: Object.values(ActionMoveEnum),
      default: ActionMoveEnum.DOWN,
    },
    inMovement: { type: Boolean, default: false },
    movementTimeout: { type: Number, default: null },
    reachedGoal: { type: Boolean, default: false },
    inGame: { type: Boolean, default: true },
  },
  { _id: false }
)

const GameSchema = new Schema<IGame & Document>({
  room: { type: String, required: true, unique: true },
  players: { type: Map, of: PlayerSchema, default: {} },
  quantityPlayersEntered: { type: Number, default: 0 },
  board: { type: [[BlockSchema]], required: true },
})

export const Game = model<IGame & Document>('Game', GameSchema)
