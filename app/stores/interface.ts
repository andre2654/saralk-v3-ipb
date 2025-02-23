interface IState {
  sideMenuOpened: boolean
  zoom: number
}

export const useInterfaceStore = defineStore('interface', {
  state: (): IState => {
    return {
      sideMenuOpened: false,
      zoom: 1.0,
    }
  },
  actions: {
    showSideMenu() {
      this.sideMenuOpened = true
    },
    hideSideMenu() {
      this.sideMenuOpened = false
    },
    increaseZoom() {
      if (this.zoom > 1.3) return
      this.zoom += 0.1
    },
    decreaseZoom() {
      if (this.zoom < 0.5) return
      this.zoom -= 0.1
    },
  },
})
