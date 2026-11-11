import type { TimeSeries, TimeSeriesData } from '@perses-dev/spec';

import type { PulzrCategoryPanelOptions } from './pulzr-category-panel-types';

export interface Category {
  name: string;
  /** None for a category not yet come: today's hours after this one, drawn as a gap. */
  value: number | null;
}

/** A series' last value that is a number. */
function lastValue(series: TimeSeries): number | undefined {
  for (let i = series.values.length - 1; i >= 0; i--) {
    const v = series.values[i]![1];
    if (v !== null && Number.isFinite(v)) return v;
  }
  return undefined;
}

/**
 * Each series is a category, named by its formatted name, valued by its last
 * value: a datasource gives an hour-of-day profile, a weekday pattern or a
 * ranking as one series per category. Series labelled `compare` (the period
 * before) and series with no points are left out; a series whose points are
 * all empty is a category with no value, a gap on its axis.
 */
export function categoriesOf(
  results: Array<{ data?: TimeSeriesData }>,
  spec: Pick<PulzrCategoryPanelOptions, 'sort' | 'limit'> = {},
): Category[] {
  const categories: Category[] = [];
  for (const series of results.flatMap((r) => r.data?.series ?? [])) {
    if (series.labels?.compare) continue;
    if (series.values.length === 0) continue;
    categories.push({ name: series.formattedName ?? series.name, value: lastValue(series) ?? null });
  }
  // Largest or smallest first, a category with no value last.
  const sign = spec.sort === 'desc' ? 1 : -1;
  const order = (v: number | null): number => (v === null ? -Infinity : sign * v);
  if (spec.sort) categories.sort((a, b) => order(b.value) - order(a.value));
  return spec.limit && spec.limit > 0 ? categories.slice(0, spec.limit) : categories;
}

/** A value's opacity for `intensity`: the largest 1, nothing below 0.15 so every value still shows. */
export function intensity(value: number, max: number): number {
  if (max <= 0) return 0.15;
  return Math.max(0.15, Math.min(1, value / max));
}

/** The values there are, without the categories that have none. */
export const valuesOf = (categories: Category[]): number[] => categories.flatMap((c) => (c.value === null ? [] : [c.value]));

/** The mean of the values, or undefined for none. */
export function mean(categories: Category[]): number | undefined {
  const values = valuesOf(categories);
  if (values.length === 0) return undefined;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** The index of the largest value: the cell a strip outlines. */
export function peakIndex(categories: Category[]): number {
  let peak = -1;
  categories.forEach((c, i) => {
    if (c.value !== null && (peak < 0 || c.value > categories[peak]!.value!)) peak = i;
  });
  return peak;
}
