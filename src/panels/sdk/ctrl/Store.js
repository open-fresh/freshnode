// Store keeps global application state.
// Call `store.subscribe()` to attach a callback function to be invoked when state changes.
// Call `store.setState()` to change the store state.
export default class Store {
  constructor(initial = {}) {
    this.state = initial;
    this.listeners = [];
    this.listenerSeq = 1;
  }

  subscribe(f) {
    const id = this.listenerSeq++;
    this.listeners.push({ id, f });
    return id;
  }

  unsubscribe(id) {
    if (id === null) {
      // unsubscribe(null) removes all listeners
      this.listeners = [];
    } else {
      const idx = this.listeners.findIndex(l => l.id === id);
      if (idx > -1) {
        this.listeners.splice(idx, 1);
      }
    }
  }

  getState() {
    return this.state;
  }

  setState(s) {
    if (this.stateLocked) {
      throw new Error(
        'Cannot set locked state. Possibly caused by nested `setState()` calls.'
      );
    }
    this.stateLocked = true;
    const prevState = this.state;
    const setState = typeof s === 'function' ? s({ ...prevState }) : s;
    const nextState = {
      ...prevState,
      ...setState
    };
    this.state = nextState;
    this.listeners.forEach(l => l.f(nextState, prevState));
    this.stateLocked = false;
  }
}
