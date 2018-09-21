import PropMapper from '../PropMapper';
import Store from '../Store';

describe('PropMapper', () => {
  it('maps props when state changes', () => {
    const dashboardStore = new Store({ foo: 'bar' });
    const panelStore = new Store();
    const mapStateToProps = (state) => {
      return { ...state, mapped: true };
    };

    let mapped = false;
    const mapper = new PropMapper(dashboardStore, panelStore, mapStateToProps);
    mapper.subscribe((state) => {
      mapped = true;
      expect(state).toEqual({
        foo: 'bar',
        mapped: true,
        panelState: {
          baz: 'juicyFart'
        }
      });
    });
    panelStore.setState({ baz: 'juicyFart' });

    expect(mapped).toBe(true);
  });
});
