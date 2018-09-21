import Store from '../../sdk/ctrl/Store';
import { PanelCtrl } from '../module.js';

describe('Debug ctrl', () => {
  const initialState = {
    debug: {
      counter: 0,
      greeting: 'Hello World'
    }
  };

  it('merges debug state', () => {
    const props = PanelCtrl.mapStateToProps(initialState);

    expect(props.counter).toBe(0);
    expect(props.greeting).toBe('Hello World');
  });

  it('increments counter when clicked', () => {
    const store = new Store(initialState);
    const props = PanelCtrl.mapStateToProps(
      store.getState(),
      store.setState.bind(store)
    );
    props.onIncrement();

    expect(store.getState().debug.counter).toBe(1);
  });

  it('Check if babel-eslint issues are fixed. See Test for more info.', () => {
    /*
    We were getting erroneus eslint no-undef errors from class properties.
    This was fixed with a combination of eslint ^4.14.0 and babel-eslint ^8.1.0 (see https://github.com/babel/babel-eslint/issues/487#issuecomment-365466900)
    However, the latest versions of babel-eslint have another issue causing linting to fail (see https://github.com/babel/babel-eslint/issues/530)
    Check if the second issue has been closed, and if so update versions for both fixes, and remove comments disabling no-undef rules in code
   */
    expect(Date.now()).toBeLessThan(Date.parse('Sep 30, 2018'));
  });
});
