function rowLayout(panels, cols = 4) {
  // separate panels into rows
  let chunk = [];
  const rows = [];
  panels.forEach((panel, idx) => {
    if (idx > 0 && idx % cols === 0) {
      rows.push(chunk);
      chunk = [];
    }
    chunk.push(panel);
  });
  if (chunk.length > 0) {
    rows.push(chunk);
  }

  const layout = [];
  rows.forEach((row) => {
    const width = 24 / row.length;
    row.forEach((panel) => {
      layout.push({
        panel,
        height: 7,
        width
      });
    });
  });

  return layout;
}

export default class LayoutMap {
  constructor() {
    this.map = {};
  }

  set(name, func) {
    this.map[name] = func;
  }

  setRow(name, func, cols = 4) {
    this.map[name] = ftState => rowLayout(func(ftState), cols);
  }

  get(name) {
    return this.map[name];
  }
}
