import { formatTargets, parseTargets } from '../targets';

describe('targets', () => {
  it('formatTargets()', () => {
    const formatted = formatTargets([
      {
        target: {
          expr: 'count(ft_entities) by (ft_aggregation)'
        },
        meta: {
          seriesType: 'foo'
        }
      },
      {
        target: {
          expr: 'count(ft_entities) by (ft_aggregation)'
        },
        meta: {
          seriesType: 'bar'
        }
      }
    ]);

    expect(formatted[0].expr).toBe('count(ft_entities) by (ft_aggregation)');
    expect(formatted[0].refId).toBe('A');
    expect(formatted[0].legendFormat).toBe(
      '{"seriesType":"foo","expr":"count(ft_entities) by (ft_aggregation)"}'
    );
    expect(formatted[1].refId).toBe('B');
  });

  it('parseTargets()', () => {
    const series = {
      target: '{"foo": "<<"what" up?>>"}'
    };

    const parsed = parseTargets([series]);
    expect(parsed[0].meta.foo).toBe('"what" up?');
  });
});
