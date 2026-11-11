import type { TimeSeriesData } from '@perses-dev/spec';

import { categoriesOf, intensity, mean, peakIndex } from './categories';

const at = (name: string, value: number | null, extra: object = {}): TimeSeriesData['series'][number] => ({
  name,
  values: [[1, value]],
  ...extra,
});
const data = (...series: TimeSeriesData['series']): { data: TimeSeriesData } => ({ data: { series } });

describe('categoriesOf', () => {
  it('is one category per series, in the order given, by formatted name', () => {
    const results = [data(at('12a', 0.1), at('1a', 0.3, { formattedName: '1 AM' }), at('2a', 0.2))];
    expect(categoriesOf(results)).toEqual([
      { name: '12a', value: 0.1 },
      { name: '1 AM', value: 0.3 },
      { name: '2a', value: 0.2 },
    ]);
  });

  it('leaves out the period compared and series with no points; one with no value is a gap', () => {
    const results = [
      data(
        at('Mon', 1),
        at('Mon · previous period', 2, { labels: { compare: 'previous' } }),
        at('Tue', null),
        { name: 'Wed', values: [] },
      ),
    ];
    expect(categoriesOf(results)).toEqual([
      { name: 'Mon', value: 1 },
      { name: 'Tue', value: null },
    ]);
  });

  it('sorts a category with no value last', () => {
    const results = [data(at('a', 1), at('b', null), at('c', 2))];
    expect(categoriesOf(results, { sort: 'desc' }).map((c) => c.name)).toEqual(['c', 'a', 'b']);
    expect(categoriesOf(results, { sort: 'asc' }).map((c) => c.name)).toEqual(['a', 'c', 'b']);
    expect(mean(categoriesOf(results))).toBe(1.5);
    expect(peakIndex(categoriesOf(results))).toBe(2);
  });

  it('sorts and limits a ranking', () => {
    const results = [data(at('a', 1), at('b', 3), at('c', 2))];
    expect(categoriesOf(results, { sort: 'desc', limit: 2 }).map((c) => c.name)).toEqual(['b', 'c']);
    expect(categoriesOf(results, { sort: 'asc' }).map((c) => c.name)).toEqual(['a', 'c', 'b']);
  });

  it('has nothing without data', () => {
    expect(categoriesOf([])).toEqual([]);
    expect(categoriesOf([{ data: undefined }])).toEqual([]);
  });
});

describe('intensity', () => {
  it('is the share of the largest, never under 0.15', () => {
    expect(intensity(5, 10)).toBe(0.5);
    expect(intensity(10, 10)).toBe(1);
    expect(intensity(0, 10)).toBe(0.15);
    expect(intensity(3, 0)).toBe(0.15);
  });
});

describe('mean and peakIndex', () => {
  it('find the average and the largest', () => {
    const c = [
      { name: 'a', value: 1 },
      { name: 'b', value: 4 },
      { name: 'c', value: 1 },
    ];
    expect(mean(c)).toBe(2);
    expect(peakIndex(c)).toBe(1);
    expect(mean([])).toBeUndefined();
    expect(peakIndex([])).toBe(-1);
  });
});
