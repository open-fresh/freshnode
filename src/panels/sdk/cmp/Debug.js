import React from 'react'; // eslint-disable-line import/no-unresolved

export default function Debug({
  counter,
  greeting,
  view,
  seriesCount,
  metricCount,
  onSetView,
  onIncrement
}) {
  const countLabel =
    view === 'series'
      ? `Series Count: ${seriesCount}`
      : `Metric Count: ${metricCount}`;

  const toggle =
    view === 'series' ? (
      <button onClick={() => onSetView('metric')}>Toggle Metric View</button>
    ) : (
      <button onClick={() => onSetView('series')}>Toggle Series View</button>
    );

  return (
    <div style={{ padding: '10px' }}>
      <span>{greeting}</span>
      <ul>
        <li>Current View: {view}</li>
        <li>{countLabel}</li>
        <li>State Counter: {counter}</li>
        <li>React Version: {React.version}</li>
      </ul>

      <button onClick={onIncrement}>Increment Counter</button>
      <br />
      {toggle}
    </div>
  );
}
