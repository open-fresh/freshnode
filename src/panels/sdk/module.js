import FtCtrl from './ctrl/Ctrl';
import Debug from './cmp/Debug';

function mapSeriesProps(ftState) {
  // get target series result data
  const series = ftState.panelState && ftState.panelState.series;
  let seriesCount = 'loading...';
  let metricCount = 'loading...';

  if (series) {
    series.forEach((results) => {
      if (results.meta.seriesID === 'seriesCount') {
        seriesCount = results.datapoints[0][0];
      } else if (results.meta.seriesID === 'metricCount') {
        metricCount = results.datapoints[0][0];
      }
    });
  }

  return { seriesCount, metricCount };
}

function mapStateToProps(ftState, setState) {
  // map shared state to component props
  const view = ftState.templateVars && ftState.templateVars.view;
  return {
    ...ftState.debug,
    ...mapSeriesProps(ftState),
    view,
    onSetView: (v) => {
      setState((currentState) => {
        return {
          templateVars: {
            ...currentState.templateVars,
            view: v
          }
        };
      });
    },
    onIncrement: () => {
      setState((currentState) => {
        return {
          debug: {
            ...currentState.debug,
            counter: currentState.debug.counter + 1
          }
        };
      });
    }
  };
}

function mapStateToTargets(ftState) {
  // define targets to query for
  if (ftState.templateVars.view === 'series') {
    return [
      {
        target: {
          expr: 'count({__name__!=""})',
          instant: true
        },
        meta: {
          seriesID: 'seriesCount'
        }
      }
    ];
  }

  return [
    {
      target: {
        expr: 'count(count({__name__!=""}) by (__name__))',
        instant: true
      },
      meta: {
        seriesID: 'metricCount'
      }
    }
  ];
}

function mapStateToLayout(ftState) {
  // define panel layout
  const { view } = ftState.templateVars;
  if (view === 'series') {
    return [
      {
        title: 'Ingested Series',
        type: 'graph',
        targets: [
          {
            expr: 'count({__name__!=""})',
            datasource: 'default',
            format: 'time_series',
            intervalFactor: 2,
            legendFormat: 'series count',
            step: 30
          }
        ]
      },
      {
        title: 'Prom CPU Seconds',
        type: 'graph',
        targets: [
          {
            expr: 'rate(process_cpu_seconds_total{job="prometheus"}[5m])',
            datasource: 'default',
            format: 'time_series',
            intervalFactor: 2,
            legendFormat: 'series count',
            step: 30
          }
        ]
      }
    ];
  }

  return [
    {
      title: 'Ingested Metrics',
      type: 'graph',
      targets: [
        {
          expr: 'count(count({__name__!=""}) by (__name__))',
          datasource: 'default',
          format: 'time_series',
          intervalFactor: 2,
          legendFormat: 'series count',
          step: 30
        }
      ]
    },
    {
      title: 'Prom Memory',
      type: 'graph',
      targets: [
        {
          expr: 'process_resident_memory_bytes{job="prometheus"}',
          datasource: 'default',
          format: 'time_series',
          intervalFactor: 2,
          legendFormat: 'series count',
          step: 30
        }
      ]
    }
  ];
}
FtCtrl.layoutMap.setRow('ft-layout', mapStateToLayout);

export class PanelCtrl extends FtCtrl {
  /* eslint-disable no-undef */
  static cmp = Debug;
  static mapStateToProps = mapStateToProps;
  static mapStateToTargets = mapStateToTargets;
  static hideTitle = false;
  static hideFrame = false;
  /* eslint-enable no-undef */

  constructor($scope, $injector) {
    super($scope, $injector);
  }
}
