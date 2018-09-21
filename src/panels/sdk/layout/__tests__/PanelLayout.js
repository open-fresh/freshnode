import PanelLayout from '../PanelLayout';

function mockDashboard() {
  return {
    panels: [],
    addPanel: jest.fn(function (panel) {
      this.panels.push(panel);
    }),
    removePanel: jest.fn(function (panel) {
      const idx = this.panels.findIndex(p => p === panel);
      this.panels.splice(idx, 1);
    })
  };
}

describe('PanelLayout', () => {
  it('addPanel() positions panel', () => {
    const dash = mockDashboard();
    const layout = new PanelLayout(dash, 10);
    layout.addPanel({ title: 'foo' });

    const addMock = dash.addPanel.mock;
    expect(addMock.calls.length).toBe(1);

    const panel = addMock.calls[0][0];
    expect(panel.title).toBe('foo');
    expect(panel.gridPos).toEqual({ x: 0, y: 10, w: 6, h: 7 });

    layout.addPanel({ title: 'bar' });
    expect(addMock.calls.length).toBe(2);
    const panel2 = addMock.calls[1][0];
    expect(panel2.title).toBe('bar');
    expect(panel2.gridPos).toEqual({ x: 6, y: 10, w: 6, h: 7 });
  });

  it('addPanel() positions rows and children', () => {
    const dash = mockDashboard();
    const layout = new PanelLayout(dash, 10);
    layout.addPanel(
      {
        title: 'foo',
        type: 'row',
        panels: [
          { panel: { title: 'bar' }, width: 12, height: 7 },
          { panel: { title: 'baz' }, width: 12, height: 7 }
        ]
      },
      24,
      1
    );

    const addMock = dash.addPanel.mock;
    expect(addMock.calls.length).toBe(1);

    const panel = addMock.calls[0][0];
    expect(panel.title).toBe('foo');
    expect(panel.id).toBe('ft-0-10');

    const bar = panel.panels[0];
    expect(bar.title).toBe('bar');
    expect(bar.id).toBe('ft-0-11');
    expect(bar.gridPos).toEqual({ h: 7, w: 12, x: 0, y: 11 });

    const baz = panel.panels[1];
    expect(baz.title).toBe('baz');
    expect(baz.id).toBe('ft-12-11');
    expect(baz.gridPos).toEqual({ h: 7, w: 12, x: 12, y: 11 });
  });

  it('addPanel() adds refIds to targets', () => {
    const dash = mockDashboard();
    const layout = new PanelLayout(dash, 10);
    layout.addPanel({
      title: 'foo',
      type: 'graph',
      targets: [{}, {}, {}]
    });

    const addMock = dash.addPanel.mock;
    expect(addMock.calls.length).toBe(1);

    const panel = addMock.calls[0][0];
    expect(panel.targets[0].refId).toBe('A');
    expect(panel.targets[1].refId).toBe('B');
    expect(panel.targets[2].refId).toBe('C');
  });

  it('removePanel()', () => {
    const dash = mockDashboard();
    const layout = new PanelLayout(dash, 10);
    layout.addPanel({ title: 'foo' });
    layout.removePanel();

    const addPanel = dash.addPanel.mock.calls[0][0];
    const removeMock = dash.removePanel.mock;
    expect(removeMock.calls.length).toBe(1);
    const removePanel = removeMock.calls[0][0];
    expect(removePanel).toBe(addPanel);
  });

  it('removePanel() with rows', () => {
    const dash = mockDashboard();
    const layout = new PanelLayout(dash, 10);
    layout.addPanel(
      {
        title: 'foo',
        type: 'row',
        panels: [
          { panel: { title: 'bar' }, width: 12, height: 7 },
          { panel: { title: 'baz' }, width: 12, height: 7 }
        ]
      },
      24,
      1
    );
    expect(layout.grid.cols).toEqual(new Array(24).fill(18));

    layout.removePanel();

    expect(layout.grid.cols).toEqual(Array(24).fill(10));
  });

  it('reset()', () => {
    const dash = mockDashboard();
    const layout = new PanelLayout(dash, 10);
    layout.addPanel({ panel: { title: 'foo' } });
    layout.addPanel({ panel: { title: 'bar' } });

    layout.reset();

    const removeMock = dash.removePanel.mock;
    expect(removeMock.calls.length).toBe(2);
    expect(layout.grid.cols).toEqual(
      Array(layout.grid.maxWidth).fill(layout.grid.y)
    );
  });

  it('sync()', () => {
    const dash = mockDashboard();
    const layout = new PanelLayout(dash, 10);
    layout.addPanel({ title: 'foo' });

    const panels = [{ panel: { title: 'bar' } }, { panel: { title: 'baz' } }];
    layout.sync(panels);

    const removeMock = dash.removePanel.mock;
    const addMock = dash.addPanel.mock;
    expect(removeMock.calls.length).toBe(1);
    expect(addMock.calls.length).toBe(3);
    expect(addMock.calls[1][0].title).toBe('bar');
    expect(addMock.calls[1][0].gridPos).toEqual({ h: 7, w: 6, x: 0, y: 10 });
    expect(addMock.calls[2][0].title).toBe('baz');
    expect(addMock.calls[2][0].gridPos).toEqual({ h: 7, w: 6, x: 6, y: 10 });
  });
});
