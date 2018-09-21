import Store from '../Store';

test('constructs with default store state', () => {
  const emptyStore = new Store();
  expect(Object.keys(emptyStore.getState()).length).toEqual(0);

  const varStore = new Store({
    company: 'Freshtracks.io',
    founders: ['Bob', 'Marc']
  });
  expect(Object.keys(varStore.getState()).length).toEqual(2);
});

test('subscribe() adds listener callbacks', () => {
  const store = new Store();

  expect(store.listeners.length).toEqual(0);
  store.subscribe(() => {});
  expect(store.listeners.length).toEqual(1);
});

test('setState() merges the new state', () => {
  const store = new Store();
  const var1 = { company: 'Freshtracks.io' };
  const var2 = { founders: ['Bob', 'Marc'] };

  expect(Object.keys(store.getState()).length).toEqual(0);

  store.setState(var1);
  expect(store.getState()).toEqual(expect.objectContaining(var1));

  store.setState(var2);
  expect(store.getState()).toEqual(expect.objectContaining(var1));
  expect(store.getState()).toEqual(expect.objectContaining(var2));

  store.setState({ company: 'PivotedName' });
  expect(store.getState()).toEqual(expect.not.objectContaining(var1));
});

test('setState() can accept a method to return new state', () => {
  const initialState = { foo: 'bar' };
  const store = new Store(initialState);

  expect(store.getState()).toEqual(expect.objectContaining(initialState));
  store.setState((state) => {
    state.foo = 'baz';
    return state;
  });
  expect(store.getState()).toEqual(expect.not.objectContaining(initialState));
});

test('setState() calls the subscribed listeners', () => {
  const store = new Store();
  let updateCount = 0;
  store.subscribe(() => {
    updateCount++;
  });

  expect(updateCount).toEqual(0);
  store.setState({ foo: 'bar' });
  store.setState({ foo: 'baz' });
  expect(updateCount).toEqual(2);
});

test('setState() calls listeners with old and new state', () => {
  const store = new Store({ foo: 'bar' });
  let statesMatch = false;
  store.subscribe((newState, oldState) => {
    statesMatch = newState.foo === oldState.foo;
  });

  store.setState({ foo: 'bar' });
  expect(statesMatch).toEqual(true);
  store.setState({ foo: 'baz' });
  expect(statesMatch).toEqual(false);

  store.setState((state) => {
    state.foo = 'baz';
    return state;
  });
  expect(statesMatch).toEqual(true);
  store.setState((state) => {
    state.foo = 'bar';
    return state;
  });
  expect(statesMatch).toEqual(false);
});

test('unsubscribe() removes specified listener callbacks', () => {
  const store = new Store();

  let fooCount = 0;
  let barCount = 0;
  const foo = store.subscribe(() => {
    fooCount++;
  });
  store.subscribe(() => {
    barCount++;
  });

  expect(store.listeners.length).toEqual(2);

  store.setState({ key: 'newValue' });
  expect(fooCount).toEqual(1);
  expect(barCount).toEqual(1);

  store.unsubscribe(foo);
  expect(store.listeners.length).toEqual(1);
  store.setState({ key: 'newValue' });
  expect(fooCount).toEqual(1);
  expect(barCount).toEqual(2);
});
