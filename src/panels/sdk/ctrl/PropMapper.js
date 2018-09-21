// PropMapper updates panel props based on store state
export default class PropMapper {
  constructor(dashboardStore, panelStore, mapStateToProps) {
    this.panelStore = panelStore;
    this.dashboardStore = dashboardStore;
    this.mapStateToProps = mapStateToProps;
  }

  mapProps() {
    const setState = this.dashboardStore.setState.bind(this.dashboardStore);
    const state = {
      ...this.dashboardStore.getState(),
      panelState: this.panelStore.getState()
    };
    return this.mapStateToProps(state, setState);
  }

  subscribe(f) {
    if (this.globalSubscribeId) {
      throw new Error('Already subscribed');
    }

    const subscriber = () => {
      f(this.mapProps());
    };
    this.localSubscribeId = this.panelStore.subscribe(subscriber);
    this.globalSubscribeId = this.dashboardStore.subscribe(subscriber);
  }

  unsubscribe() {
    if (this.localSubscribeId) {
      this.panelStore.unsubscribe(this.localSubscribeId);
    }

    if (this.globalSubscribeId) {
      this.dashboardStore.unsubscribe(this.globalSubscribeId);
    }
  }
}
