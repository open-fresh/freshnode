# freshnode

This [Grafana](https://grafana.com/) application contains a dashboard that demonstrates concepts for creating panel plugins with [React](https://reactjs.org/).

This project is an experiment to extend Grafana with simple plugin APIs for sharing data and dynamically updating dashboard definitions based on user actions and data payload. The plugin implements the following features:  

* extendable base class controller for rendering panel content with React
* pluggable React components
* shared state and prop mapping for all React plugins on a dashboard
* programatically definable targets for dynamic series querying
* dynamic panel layout for programatically defining dashboard panel layout and definitions

## Developing (MacOS)

### Build

```bash
cd $HOME
git clone https://github.com/Fresh-Tracks/freshnode
cd freshnode
brew install jsonnet
npm i
npm run clean && npm test && npm run build
```

### Run Grafana Docker image with freshnode plugins

Run Grafana:

```bash
docker run -d -p 3000:3000 \
  -v $HOME/grafana:/var/lib/grafana \
  -v $HOME/freshnode:/var/lib/grafana/plugins/freshnode/freshnode \
  -v $HOME/freshnode/src/provisioning:/etc/grafana/provisioning \
  -e "GF_SECURITY_ADMIN_PASSWORD=secret" \
  grafana/grafana:5.2.3
```

### Configure Datasource

The docker command above will automatically provision a default datasource for querying a [Prometheus demo server](http://demo.robustperception.io:9090) hosted by [Robust Perception](https://www.robustperception.io).
Edit the datasource config file located at `src/provisioning/datasources` if you'd like to connect to a different Prometheus server
or use a different default datasource. The image must be restarted after editing.

### Enable FreshTracks application

* Navigate to [Configuration->Plugins->FreshTracks](http://localhost:3000/plugins/freshtracks-app/edit) and enable the application.
* Navigate to [Configuration->Plugins->Dashboards](http://localhost:3000/plugins/freshtracks-app/edit?tab=dashboards) and import the dashboard.
* Navigate to [FreshTracks->React Panels](http://localhost:3000/d/ft-app-node/react-panels) to view the dashboard.

Note: light theme is recommended, since this experiment has not been style properly.

### Viewing changes

* Watch for dashboard changes: `npm run watch-dash`
* Watch for plugin changes: `npm run watch-plugin`

Both watch commands require browser refresh after build completes.

## React plugin development

### Plugin creation

All plugins extend `FtCtrl` and specify the react component to render with the `cmp` property.

```javascript
import FtCtrl from '../ft-sdk/ctrl/Ctrl';
import CustomCmp from './cmp/Custom';

class PanelCtrl extends FtCtrl {
  // React component to render
  static cmp = CustomCmp;

  // constructor must always be present.
  constructor($scope, $injector) {
    super($scope, $injector);
  }
}
```

### Shared state

Plugins implement the `mapStateToProps` function to map shared state to React component props.

```javascript
function mapStateToProps(state) {
  return {
    isActive: state.globalOption.isActive
  };
}

class PanelCtrl extends FtCtrl {
  static mapStateToProps = mapStateToProps;
 // ...
}
```

### Mutating shared state

Use the 2nd argument to `mapStateToProps` to mutate shared state in response to a user action.

```javascript
function mapStateToProps(state, setState) {
  return {
    onClick: () => {
      setState(state => ({ counter: state.counter + 1 });
    }
  };
}
```

### Grafana dashboard template vars

Grafana dashboard template variables are kept in the `templateVars` field of the state object. Plugins can read or mutate this portion of the state using the normal methods. Mutated template variables will be automatically updated on the dashboard and in the URL.

```javascript
function mapStateToProps(state, setState) {
  return {
    navPath: state.templateVars.ft_nav_path,
    onClick: () => {
      setState(state => ({
        ...state.templateVars,
        ft_nav_path: 'ft_cluster:foo'
      });
    }
  };
}
```

### Requesting query data

Plugins implement the `mapStateToTargets` function to request query data from Grafana. Queried data will be present in `state.panelState.series`.

```javascript
function mapStateToTargets(state) {
  return [{
    target: {
      expr: `ft_entities{ft_aggregation="${state.aggregation}"}`
    },
    meta: {
      seriesType: 'entity',
      aggregation: state.aggregation
    }
  }];
}

function mapStateToProps(state) {
  return {
    seriesToChart: state.panelState.series
  };
}

class PanelCtrl extends FtCtrl {
  static mapStateToTargets = mapStateToTargets;
  static mapStateToProps = mapStateToProps;
 // ...
}
```

### Plugin tests

The easiest way to test plugins is to test `mapStateToProps` and `mapStateToTargets` directly and leave rendering tests to the component. We will likely also need browser style integration tests at some point in the future.
See `src/panel/sdk/__tests__/module.js` for an example plugin unit test.


```javascript
describe('mah plugin', () => {
  it('increments counter when clicked', () => {
    const store = new Store(initialState);
    const props = PanelCtrl.mapStateToProps(store.getState(), store.setState.bind(store));
    props.onClick();

    expect(store.getState().debug.counter).toBe(1);
  });
});
```

### Component tests

Test component rendering by rendering each component individually without it's parent plugin/controller.
See `src/panel/sdk/cmp/__tests__/debug.js` for an example component unit test.

```javascript
describe('Debug cmp', () => {
  it('renders greeting and counter', () => {
    const { container } = render(<Debug greeting="Hello World" counter={ 15 } />);
  
    expect(container).toHaveTextContent('Hello World');
    expect(container).toHaveTextContent('Counter: 15');
  });
});
```

### Shared libraries

The code for each plugin is loaded on-demand at runtime. Code that is shared between plugins is located in the `src/lib` directory and must be exported in `src/lib/sdk.js`. Exported code is packaged with webpack configured in `src/lib/webpack.config.js`, and can be imported from a plugin like this: `import { React, FtUtil } from '../ft-sdk/sdk'`.
