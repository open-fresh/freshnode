import { MetricsPanelCtrl } from 'app/plugins/sdk';
import React from 'react'; // eslint-disable-line import/no-unresolved
import ReactDOM from 'react-dom'; // eslint-disable-line import/no-unresolved

import Panel from '../cmp/Panel';
import Store from './Store';
import PropMapper from './PropMapper';
import LayoutMap from '../layout/LayoutMap';
import PanelLayout from '../layout/PanelLayout';
import { shallowequal } from '../util/shallowequal';
import { readTemplateVars, writeTemplateVars } from '../util/template';
import { formatTargets, parseTargets } from '../util/targets';

const rootCls = 'ft-root';
let ftStore = false;
const initialState = {
  debug: {
    counter: 0,
    greeting: 'FreshTracks React Debug Panel'
  }
};

// Extend Ctrl to create a new ft plugin.
// Set `static cmp` to define a React component to render.
// Override `Ctrl.mapStateToProps` to map state from `ftStore` to props passed to `cmp`.
// Override `Ctrl.mapStateToTargets` to map state from `ftStore` to target queries.
export default class Ctrl extends MetricsPanelCtrl {
  /* eslint-disable no-undef */
  static template = `<div class="${rootCls}"></div>`;
  static hideTitle = false;
  static hideFrame = false;
  static mapStateToProps = state => state;
  static mapStateToTargets = () => [];
  static layoutMap = new LayoutMap();
  /* eslint-enable no-undef */

  constructor($scope, $injector) {
    super($scope, $injector);
    this.initPanel();
  }

  link(scope, el) {
    this.panelEl = el.get()[0];
    setTimeout(() => {
      this.stylePanel();
      this.reactMount();
    }, 50);
  }

  initPanel() {
    if (ftStore === false) {
      // this init happens once per-dashboard
      this.isFtRoot = true;
      this.initStore();
    }

    this.initPanelStore();
    this.panel.targets = this.buildTargets();
    this.events.on('panel-teardown', this.onTearDown.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
  }

  initStore() {
    const scope = this.$scope;
    const timeSrv = this.$injector.get('timeSrv');
    const variableSrv = this.$injector.get('variableSrv');

    // ftStore is shared among all panels and
    // is used to store global application state
    ftStore = new Store({
      ...initialState,
      templateVars: readTemplateVars(variableSrv)
    });

    ftStore.subscribe((nextState, prevState) => {
      if (!shallowequal(nextState.templateVars, prevState.templateVars)) {
        // handle template vars changed from plugin
        writeTemplateVars(scope, timeSrv, variableSrv, nextState.templateVars);
      }

      // update dynamic panel layout
      this.syncPanels(nextState);
    });

    scope.$root.$on('template-variable-value-updated', () => {
      // handle template vars changed from Grafana
      const templateVars = readTemplateVars(variableSrv);
      if (!shallowequal(templateVars, ftStore.state.templateVars)) {
        ftStore.setState({ templateVars });
      }
    });

    // initial dynamic panel layout
    this.syncPanels(ftStore.state);
  }

  initPanelStore() {
    // panelStore is unique to a single plugin instance and
    // is used to store query results and other panel specific data
    this.panelStore = new Store();
    this.storeSubscriber = ftStore.subscribe(() => {
      this.syncTargets();
    });

    this.propMapper = new PropMapper(
      ftStore,
      this.panelStore,
      this.constructor.mapStateToProps
    );
  }

  buildTargets() {
    const state = ftStore.getState();
    const targets = this.constructor.mapStateToTargets(state);
    return formatTargets(targets);
  }

  syncTargets() {
    // targets are private to a single panel instance
    const targets = this.buildTargets();
    if (JSON.stringify(targets) !== JSON.stringify(this.panel.targets)) {
      this.panel.targets = targets;
      this.refresh();
    }
  }

  syncPanels(ftState) {
    if (!this.panelLayout) {
      const startY = this.dashboard.panels.reduce((acc, panel) => {
        const nextY = panel.gridPos.y + panel.gridPos.h + 1;
        return Math.max(acc, nextY);
      }, 0);
      this.panelLayout = new PanelLayout(this.dashboard, startY);
    }

    const layoutKey = ftState.templateVars.panellayout;
    if (!layoutKey) {
      return;
    }

    const mapStateToLayout = Ctrl.layoutMap.get(layoutKey);
    if (!mapStateToLayout) {
      throw new Error('unmapped layout key');
    }

    const layout = mapStateToLayout(ftState);
    if (
      !this.layout ||
      JSON.stringify(this.layout) !== JSON.stringify(layout)
    ) {
      this.panelLayout.sync(layout);
    }
  }

  refresh() {
    if (this.panel.targets && this.panel.targets.length) {
      super.refresh();
    }
  }

  stylePanel() {
    if (this.panelEl) {
      if (this.constructor.hideTitle) {
        this.panelEl.querySelector('.panel-title-container').style.display =
          'none';
      }

      if (this.constructor.hideFrame) {
        const container = this.panelEl.querySelector('.panel-container');
        container.style.backgroundColor = 'transparent';
        container.style.borderColor = 'transparent';

        let parent = this.panelEl.parentNode;
        while (parent) {
          if (parent.className.includes('react-grid-item')) {
            const handle = parent.querySelector('.react-resizable-handle');
            if (handle) {
              handle.style.display = 'none';
            }
            break;
          }
          parent = parent.parentNode;
        }
      }

      // add ur own padding jabroni
      this.panelEl.querySelector('.panel-content').style.padding = '0';
    }
  }

  getReactWrapper() {
    if (this.panelEl) {
      return this.panelEl.querySelector(`.${rootCls}`);
    }

    return null;
  }

  reactMount() {
    const wrapper = this.getReactWrapper();
    const cmp = this.constructor.cmp;
    if (wrapper && cmp) {
      this.renderedCmp = ReactDOM.render(
        <Panel cmp={cmp} propMapper={this.propMapper} />,
        wrapper
      );
    }
  }

  reactUnmount() {
    const wrapper = this.getReactWrapper();
    if (wrapper) {
      ReactDOM.unmountComponentAtNode(wrapper);
    }
  }

  onTearDown() {
    this.reactUnmount();

    if (this.panelStore) {
      this.panelStore.unsubscribe(null);
      this.panelStore = null;
    }

    if (this.propMapper) {
      this.propMapper = null;
    }

    if (this.panelLayout) {
      this.panelLayout = null;
    }

    if (ftStore) {
      if (this.storeSubscriber) {
        ftStore.unsubscribe(this.storeSubscriber);
        this.storeSubscriber = null;
      }

      if (this.isFtRoot) {
        // clear state between dashboard navigations
        ftStore.unsubscribe(null);
        ftStore = false;
      }
    }
  }

  onDataReceived(datalist) {
    const series = parseTargets(datalist);
    this.propMapper.panelStore.setState({ series });
  }

  onDataError(err) {
    console.warn(err); // eslint-disable-line no-console
  }
}
