class Grid {
  constructor(y) {
    this.maxWidth = 24;
    this.y = y;
    this.cols = Array(this.maxWidth).fill(this.y);
  }

  addPanel(width = 6, height = 7) {
    // adds panels left->right and jumps to next row when full
    if (width > this.maxWidth) {
      throw new Error('WIDE LOAD!');
    }

    const colHeights = this.cols.map((col, idx) => {
      if (idx + width > this.cols.length) {
        return Infinity;
      }
      return Math.max(...this.cols.slice(idx, idx + width));
    });
    const minColHeight = Math.min(...colHeights);
    const minColIdx = colHeights.indexOf(minColHeight);
    for (let idx = minColIdx; idx < minColIdx + width; idx++) {
      this.cols[idx] += height;
    }

    return {
      x: minColIdx,
      y: minColHeight,
      w: width,
      h: height
    };
  }

  removePanel(panel) {
    const { x, h, w } = panel.gridPos;
    for (let idx = x; idx < x + w; idx++) {
      this.cols[idx] -= h;
    }
  }
}

export default class PanelLayout {
  constructor(dashboard, y) {
    this.dashboard = dashboard;
    this.grid = new Grid(y);
  }

  positionPanel(panel, width, height) {
    const gridPos = this.grid.addPanel(width, height);
    const positioned = {
      ...panel,
      gridPos,
      id: `ft-${gridPos.x}-${gridPos.y}`
    };

    if (panel.targets) {
      positioned.targets = panel.targets.map((t, idx) => {
        return {
          ...t,
          refId: String.fromCharCode(65 + idx)
        };
      });
    }

    return positioned;
  }

  addPanel(panel, width = 6, height = 7) {
    const positioned = this.positionPanel(panel, width, height);

    if (positioned.type === 'row' && positioned.panels) {
      positioned.panels = positioned.panels.map(p =>
        this.positionPanel(p.panel, p.width, p.height)
      );
    }

    this.dashboard.addPanel(positioned);
  }

  removePanel() {
    const panel = this.dashboard.panels[this.dashboard.panels.length - 1];
    if (panel) {
      this.dashboard.removePanel(panel);
      this.grid.removePanel(panel);

      if (panel.type === 'row' && panel.panels) {
        // clear grid positions for row children too
        panel.panels.forEach(p => this.grid.removePanel(p));
      }
    }
  }

  reset() {
    while (
      this.dashboard.panels &&
      this.dashboard.panels.length &&
      Math.max(...this.grid.cols) > this.grid.y
    ) {
      this.removePanel();
    }
  }

  sync(layout) {
    // blow it all away instead of actually syncing,
    // but this could be optimized to only update changed panels.
    this.reset();

    layout.forEach((panel) => {
      this.addPanel(panel.panel, panel.width, panel.height);
    });
  }
}
