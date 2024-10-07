const STOPWATCH_DEFAULT = 60 * 10 // 10 minutes

interface IState {
  sideMenuOpened: boolean
}

export const useInterfaceStore = defineStore('interface', {
  state: (): IState => {
    return {
      sideMenuOpened: false
    }
  },
  actions: {
    showSideMenu() {
      this.sideMenuOpened = true
    },
    hideSideMenu() {
      this.sideMenuOpened = false
    },
  },
})
