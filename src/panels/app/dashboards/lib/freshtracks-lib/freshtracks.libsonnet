local grafana = import 'grafana.libsonnet';

local defaults = {
  panelWidth: 8,
  panelHeight: 7,
  maxWidth: 24,
};

{
  dashboard(title, uid='defaultDashboardUID', panelWidth=defaults.panelWidth, panelHeight=defaults.panelHeight, maxWidth=24, revision=1):: (
    grafana.dashboard.new(
      title,
      time_from='now-1h',
      refresh='1m',
      editable=false,
      uid=uid,
    ) + {
      maxWidth::
        if maxWidth > 24 then
          error 'Max row width cannot be greater than 24.'
        else
          maxWidth,
      id:: null,
      addTag(name):: self {
        tags+: [name],
      },
      defaultPanelWidth:: panelWidth,
      defaultPanelHeight:: panelHeight,
      revision: revision,
      version: revision,

      addTemplateVariable(current, name, label, query, type, display='hide', options=[], regex='.+', includeAll=false, allValue='.+'):: self {
        templating+: {
          list+: [{
            allFormat: 'glob',
            allValue: allValue,
            current: current,
            datasource: '$datasource',
            hide: if display == 'hide' then 2 else 0,
            includeAll: includeAll,
            label: label,
            multi: false,
            name: name,
            options: options,
            query: query,
            refresh: 1,
            regex: regex,
            sort: 1,
            tagValuesQuery: '',
            tags: [],
            tagsQuery: '',
            type: type,
            useTags: false,
          }],
        },
      },
      addFTTemplateVariables(hide=[])::
        self.addTemplateVariable(
          { text: 'default', value: 'default' },
          'datasource',
          'datasource',
          'prometheus',
          'datasource',
          'hide'
        )
        .addTemplateVariable(
          { text: '', value: '' },
          'cluster',
          'cluster',
          'label_values(ft_cluster)',
          'query',
          'show'
        )
        .addTemplateVariable(
          { text: 'default', value: 'default' },
          'namespace',
          'namespace',
          'label_values(namespace)',
          'query',
          'show'
        )
        .addTemplateVariable(
          { text: 'namespace', value: 'namespace' },
          'ft_hierarchy',
          'ft_hierarchy',
          'namespace, ft_workload, ft_pod, ft_container',
          'custom',
          'hide',
          [
            {
              selected: true,
              text: 'namespace',
              value: 'namespace',
            },
            {
              selected: false,
              text: 'ft_workload',
              value: 'ft_workload',
            },
            {
              selected: false,
              text: 'ft_pod',
              value: 'ft_pod',
            },
            {
              selected: false,
              text: 'ft_container',
              value: 'ft_container',
            },
          ]
        )
        .addTemplateVariable(
          { text: 'ft_namespace', value: 'ft_namespace' },
          'ft_hierarchy_child',
          'ft_hierarchy_child',
          'ft_workload, ft_pod, ft_container',
          'custom',
          'hide',
          [
            {
              selected: false,
              text: 'ft_workload',
              value: 'ft_workload',
            },
            {
              selected: false,
              text: 'ft_pod',
              value: 'ft_pod',
            },
            {
              selected: false,
              text: 'ft_container',
              value: 'ft_container',
            },
          ]
        )
        .addTemplateVariable(
          { text: 'default', value: 'default' },
          'ft_id',
          'ft_id',
          'default',
          'custom',
          'hide'
        )
        .addTemplateVariable(
          { text: 'default', value: 'ft_namespace=default' },
          'ft_node',
          'ft_node',
          'default',
          'custom',
          'hide'
        )
        .addTemplateVariable(
          { text: 'namespace', value: 'namespace' },
          'ft_level',
          'ft_level',
          'namespace',
          'custom',
          'hide'
        ),
    }
  ) + $.hasPanels,

  hasPanels: {
    local _parent = self,
    _nextPanelPos:: { x: 0, y: 0, prevHeight: 0 },
    _nextPanel:: 0,

    defaultPanelWidth:: if 'defaultPanelWidth' in super then
      super.defaultPanelWidth
    else
      defaults.panelWidth,
    defaultPanelHeight:: if 'defaultPanelHeight' in super then
      super.defaultPanelHeight
    else
      defaults.panelHeight,


    addPanel(panel, gridPos={}, height=_parent.defaultPanelHeight, width=_parent.defaultPanelWidth, forceNewRow=false):: (
      if std.objectHas(gridPos, 'x') then
        self + self.addPanels([panel { gridPos: gridPos }]) + {
          _nextPanelPos: {
            x: gridPos.x + gridPos.w,
            y: gridPos.y,
            prevHeight: gridPos.h,
          },
        }

      else
        local _height = (
          if panel.type == 'row' then
            1
          else
            height
        );
        local _width = (
          if panel.type == 'row' then
            _parent.maxWidth
          else
            width
        );
        local thisPanelPos = {
          h: _height,
          w: _width,
        } + if forceNewRow || _parent._nextPanelPos.x + _width > _parent.maxWidth then
          { x: 0, y: _parent._nextPanelPos.y + _parent._nextPanelPos.prevHeight }
        else
          { x: _parent._nextPanelPos.x, y: _parent._nextPanelPos.y };

        self + self.addPanels([panel { gridPos: thisPanelPos }]) + {
          _nextPanelPos: {
            x: thisPanelPos.x + _width,
            y: thisPanelPos.y,
            prevHeight: _height,
          },
        }
    ),
    generatePanels(constructor, metrics, height=_parent.defaultPanelHeight, width=_parent.defaultPanelWidth):: (
      local generatePanel(parent, metric) = (
        local returnedPanels = constructor(metric);
        local newPanels = if std.type(returnedPanels) == 'array' then
          returnedPanels
        else
          [returnedPanels];

        local options = if std.objectHas(metric, 'options') then
          metric.options
        else
          {};

        local genPanel(parent, panel) = (
          local thisPanelPos = if std.objectHas(metric, 'gridPos') then
            metric.gridPos
          else
            {
              h: height,
              w: width,
            } + if parent._nextPanelPos.x + width > parent.maxWidth then
              { x: 0, y: parent._nextPanelPos.y + parent._nextPanelPos.prevHeight }
            else
              { x: parent._nextPanelPos.x, y: parent._nextPanelPos.y };

          parent {
            panels+: [panel { gridPos: thisPanelPos, id: parent._nextPanel } + options],
            _nextPanel+: 1,
            _nextPanelPos: {
              x: thisPanelPos.x + width,
              y: thisPanelPos.y,
              prevHeight: height,
            },
          }
        );

        std.foldl(genPanel, newPanels, parent)
      );
      std.foldl(generatePanel, metrics, self)
    ),
  },


  row(title, gridPos=null, collapsed=false, panelWidth=defaults.panelWidth, panelHeight=defaults.panelHeight, maxWidth=defaults.maxWidth):: {
    collapsed: collapsed,
    gridPos: gridPos,
    panels: [],
    repeat: null,
    title: title,
    type: 'row',
    defaultPanelWidth: panelWidth,
    defaultPanelHeight: panelHeight,
    maxWidth::
      if maxWidth > 24 then
        error 'Max row width cannot be greater than 24.'
      else
        maxWidth,
  } + $.hasPanels,

  graphPanel(title, targets=[], yFormat='short', yLabel=null, type='default'):: (
    grafana.graphPanel.new(
      title,
      nullPointMode='null as zero',
      format=yFormat,
    ) + {
      //            targets: std.foldl($.generateTargets, targets, []),
      targets: [
        grafana.prometheus.target(
          target.query,
          datasource='default',
          legendFormat=target.legendFormat,
        ) + {
          step: 30,
          [if std.objectHas(target, 'metric') then 'metric']: target.metric,
        }
        for target in targets
      ],
      yaxes: $.yaxes(yFormat, label=yLabel),
      [if type == 'stack' then 'stack']: true,
      [if type == 'stack' then 'fill']: 10,
      [if type == 'stack' then 'linewidth']: 0,
      [if type == 'comparison' then 'fill']: 0,
      [if type == 'comparison' then 'tooltip']: {
        shared: true,
        sort: 2,
        value_type: 'individual',
      },
    }
  ),

  dashlistPanel(title, folderId, tags=[], query='', starred=false):: {
    type: 'dashlist',
    title: title,
    folderId: folderId,
    tags: tags,
    starred: starred,
    headings: true,
    limit: 10,
    links: [],
    query: query,
    recent: false,
    search: true,
  },

  generateTargets(arr, target):: (
    arr + [grafana.prometheus.target(
      target.query,
      datasource='default',
      legendFormat=target.legendFormat,
    ) + {
      step: 30,
    }]
  ),

  yaxes(format, label=null):: [
    {
      format: format,
      label: label,
      logBase: 1,
      max: null,
      min: null,
      show: true,
    },
    {
      format: 'short',
      label: null,
      logBase: 1,
      max: null,
      min: null,
      show: true,
    },
  ],

  pluginPanel(type):: {
    datasource: null,
    err: false,
    span: 12,
    targets: [],
    type: type,
  },

  queryPanel(query, legend, fillBelowTo=''):: {
    seriesOverrides+: [
      {
        alias: legend,
        legend: false,
        fillBelowTo: fillBelowTo,
        zindex: if legend == 'value' then 3 else 0,
      },
    ],
    targets+: [
      {
        expr: query,
        format: 'time_series',
        intervalFactor: 2,
        legendFormat: legend,
        step: 10,
      },
    ],
  },

  singlestatPanel(title, query, gauge=true):: (
    grafana.singlestat.new(
      title,
      colors=[
        'rgba(50, 172, 45, 0.97)',
        'rgba(237, 129, 40, 0.89)',
        'rgba(245, 54, 54, 0.9)',
      ],
      format='short',
      height='180px',
      span=4,
      thresholds='65, 90',
      valueName='current',
    )
    .addTarget(
      grafana.prometheus.target(
        query,
        datasource='default',
      )
    ) + {
      [if gauge then 'format']: 'percent',
      [if gauge then 'colorValue']: 'true',
      [if gauge then 'gauge']: {
        maxValue: 100,
        minValue: 0,
        show: true,
        thresholdLabels: false,
        thresholdMarkers: true,
      },
    }
  ),
}
