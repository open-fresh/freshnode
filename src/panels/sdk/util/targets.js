const spaceshipExp = new RegExp('<<(.*?)>>', 'g');
const quoteExp = new RegExp('"', 'g');

function quoteReplace(outer, inner) {
  return inner.replace(quoteExp, '\\"');
}

function quoteSpaceship(input) {
  return input.replace(spaceshipExp, quoteReplace);
}

export function formatTargets(targets) {
  return targets.map((t, idx) => {
    const refChar = String.fromCharCode(65 + (idx % 26));
    let refId = refChar;
    for (let i = 0; i < Math.floor(idx / 26); i++) {
      refId += refChar;
    }

    return {
      refId,
      format: 'time_series',
      legendFormat: JSON.stringify({ ...t.meta, expr: t.target.expr }),
      interval: '15s',
      intervalFactor: 1,
      ...t.target
    };
  });
}

export function parseTargets(datalist) {
  return datalist.map(series => ({
    ...series,
    meta: JSON.parse(quoteSpaceship(series.target))
  }));
}

export function formatAggregationTarget() {
  return {
    target: {
      expr:
        'count(ft_entities) by (ft_cluster, ft_namespace, ft_aggregation, ft_application, ft_metrics, ft_display)',
      interval: '5m'
    },
    meta: {
      seriesType: 'aggregation',
      labels: {
        ft_cluster: '{{ft_cluster}}',
        ft_namespace: '{{ft_namespace}}',
        ft_aggregation: '{{ft_aggregation}}',
        ft_application: '{{ft_application}}',
        // use spaceship <<>> to escape double quote chars
        // that may appear in a templated value
        ft_metrics: '<<{{ft_metrics}}>>',
        ft_display: '<<{{ft_display}}>>'
      }
    }
  };
}
