import { ActionMoveEnum } from '@/enums/actions'

interface IState {
  position: {
    x: number
    y: number
  }
  direction: ActionMoveEnum
  inMovement: boolean
  movementTimeoutId: number | null
}

export const useCharacterStore = defineStore('character', {
  state: (): IState => {
    return {
      position: {
        x: 0,
        y: 0,
      },
      direction: ActionMoveEnum.RIGHT,
      inMovement: false,
      movementTimeoutId: null,
    }
  },
  actions: {
    move(direction: ActionMoveEnum) {
      this.direction = direction

      if (this.inMovement) {
        return
      }

      this.inMovement = true

      if (this.movementTimeoutId) {
        clearTimeout(this.movementTimeoutId)
      }

      this.movementTimeoutId = window.setTimeout(() => {
        this.inMovement = false
        this.movementTimeoutId = null
      }, 350)

      // Move o personagem
      switch (direction) {
        case ActionMoveEnum.LEFT:
          this.position.x -= 1
          break
        case ActionMoveEnum.RIGHT:
          this.position.x += 1
          break
        case ActionMoveEnum.TOP:
          this.position.y -= 1
          break
        case ActionMoveEnum.DOWN:
          this.position.y += 1
          break
        default:
          break
      }
    },
    moveLeft() {
      this.move(ActionMoveEnum.LEFT)
    },
    moveRight() {
      this.move(ActionMoveEnum.RIGHT)
    },
    moveUp() {
      this.move(ActionMoveEnum.TOP)
    },
    moveDown() {
      this.move(ActionMoveEnum.DOWN)
    },
  },
})
