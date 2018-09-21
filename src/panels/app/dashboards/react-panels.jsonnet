local ft = import 'freshtracks.libsonnet';

ft.dashboard(
  title='React Panels',
  uid='ft-react-panels',
  panelWidth=6,
  revision=1
)
.addTag('FreshTracks')
.addPanel(
  {title: 'debug 1'} + ft.pluginPanel('ft-sdk'),
  width=12,
)
.addPanel(
  {title: 'debug 2'} + ft.pluginPanel('ft-sdk'),
  width=12,
)
.addTemplateVariable(
  { text: 'series', value: 'series' },
  'view',
  'view',
  'series',
  'custom',
  'show',
  [
    {
      selected: true,
      text: 'series',
      value: 'series',
    },
    {
      selected: true,
      text: 'metrics',
      value: 'metrics',
    },
  ]
)
.addTemplateVariable(
  { text: 'example layout', value: 'ft-layout' },
  'panellayout',
  'panellayout',
  'ft-layout',
  'custom',
  'hide',
  [
    {
      selected: true,
      text: 'example layout',
      value: 'ft-layout',
    },
  ]
)