const STOPWATCH_DEFAULT = 60 * 10 // 10 minutes

interface IState {
  game: {
    stopwatch: {
      time: number
      interval: any
    }
  }
}

export const useUtilitiesStore = defineStore('utilities', {
  state: (): IState => {
    return {
      game: {
        stopwatch: {
          time: 0,
          interval: null
        }
      }
    }
  },
  actions: {
    startStopwatch() {
      this.game.stopwatch.time = STOPWATCH_DEFAULT - 1

      this.game.stopwatch.interval = setInterval(() => {
        this.game.stopwatch.time -= 1

        if (this.game.stopwatch.time <= 0) {
          this.game.stopwatch.time = STOPWATCH_DEFAULT - 1
        }
      }, 1000)
    },
    stopStopwatch() {
      this.game.stopwatch.time = 0

      clearInterval(this.game.stopwatch.interval)
    },
  },
})
