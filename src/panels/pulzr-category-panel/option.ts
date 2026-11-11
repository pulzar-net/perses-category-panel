import type { FormatOptions } from '@perses-dev/components';
import { formatValue } from '@perses-dev/components';
import type { EChartsCoreOption } from 'echarts/core';

import type { Category } from './categories';
import { intensity, mean, valuesOf } from './categories';
import type { PulzrCategoryPanelOptions } from './pulzr-category-panel-types';

const NAME = { nameLocation: 'middle', nameTextStyle: { fontSize: 10 } } as const;

const CURRENCIES = new Set([
  'aud',
  'cad',
  'chf',
  'cny',
  'eur',
  'gbp',
  'hkd',
  'inr',
  'jpy',
  'krw',
  'nok',
  'nzd',
  'sek',
  'sgd',
  'usd',
]);

/** A value as a short label: money as `$5.7k`, `$12k`, `$1.2M`, `$680`; anything else by its format. */
export function compactLabel(v: number, format: FormatOptions): string {
  if (!CURRENCIES.has(format.unit ?? '')) return formatValue(v, format);
  const symbol =
    new Intl.NumberFormat('en-US', { style: 'currency', currency: format.unit!.toUpperCase() })
      .formatToParts(0)
      .find((p) => p.type === 'currency')?.value ?? '';
  const size = Math.abs(v);
  if (size >= 1_000_000) return `${symbol}${(v / 1_000_000).toFixed(1)}M`;
  if (size >= 1000) return `${symbol}${(v / 1000).toFixed(size >= 10_000 ? 0 : 1)}k`;
  return `${symbol}${Math.round(v)}`;
}

/** A category's name cut to `at` characters, as a ranking's names are. */
const cut = (name: string, at = 22): string => (name.length > at ? `${name.slice(0, at - 1)}…` : name);

/** The ECharts option for columns, a line or an area across the categories. */
export function chartOption(categories: Category[], spec: PulzrCategoryPanelOptions, color: string): EChartsCoreOption {
  const display = spec.display ?? 'bar';
  const format: FormatOptions = spec.format ?? { unit: 'decimal' };
  const max = Math.max(0, ...valuesOf(categories));
  const average = spec.average ? mean(categories) : undefined;
  const data = categories.map((c) =>
    spec.intensity && display === 'bar' && c.value !== null ? { value: c.value, itemStyle: { opacity: intensity(c.value, max) } } : c.value,
  );
  const horizontal = spec.orientation === 'horizontal' && display === 'bar';
  const categoryAxis = {
    type: 'category',
    data: categories.map((c) => (horizontal ? cut(c.name) : c.name)),
    boundaryGap: display === 'bar',
    axisTick: { show: false },
    ...(spec.xAxis?.labelEvery && !horizontal ? { axisLabel: { interval: spec.xAxis.labelEvery - 1 } } : {}),
    ...(horizontal ? { inverse: true, axisLine: { show: false }, axisLabel: { fontSize: 11 } } : {}),
    ...(spec.xAxis?.label ? { ...NAME, name: spec.xAxis.label, nameGap: 22 } : {}),
  };
  const valueAxis = horizontal
    ? { type: 'value', show: false, min: 0, max: 'dataMax' }
    : {
        type: 'value',
        min: spec.yAxis?.min,
        max: spec.yAxis?.max,
        // Whole numbers step by whole numbers: 0.5 written to no places reads as 1, twice.
        ...(format.decimalPlaces === 0 && !format.unit?.startsWith('percent') ? { minInterval: 1 } : {}),
        axisLabel: { formatter: (v: number): string => formatValue(v, format) },
        ...(spec.yAxis?.label ? { ...NAME, name: spec.yAxis.label, nameGap: 34 } : {}),
      };
  return {
    grid: {
      top: 8,
      // Room for the value labels after the longest bar.
      right: horizontal && spec.labels ? 64 : 8,
      bottom: spec.xAxis?.label ? 18 : 0,
      left: spec.yAxis?.label ? 18 : 0,
      containLabel: true,
    },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: display === 'bar' ? 'shadow' : 'line' },
      valueFormatter: (v: number) => formatValue(v, format),
    },
    series: [
      {
        type: display === 'bar' ? 'bar' : 'line',
        data,
        itemStyle: { color },
        barMaxWidth: spec.maxBarWidth === 0 ? undefined : (spec.maxBarWidth ?? 32),
        ...(horizontal ? { barCategoryGap: '24%', itemStyle: { color, borderRadius: [0, 4, 4, 0] } } : {}),
        ...(spec.labels
          ? {
              label: {
                show: true,
                position: horizontal ? 'right' : 'top',
                fontSize: 11,
                formatter: ({ value }: { value: number | { value: number } }) =>
                  compactLabel(typeof value === 'number' ? value : value.value, format),
              },
            }
          : {}),
        smooth: true,
        // Every dot, as asked, in a circle even where the host's theme draws lines without
        // symbols: ECharts leaves some out when they crowd, and a theme's `symbol` wins otherwise.
        showSymbol: Boolean(spec.points),
        showAllSymbol: Boolean(spec.points),
        ...(spec.points ? { symbol: 'circle' } : {}),
        symbolSize: 4,
        lineStyle: { width: 1.5 },
        ...(display === 'area' ? { areaStyle: { opacity: spec.areaOpacity ?? 0.12 } } : {}),
        ...(average === undefined
          ? {}
          : {
              markLine: {
                silent: true,
                symbol: 'none',
                label: { show: false },
                lineStyle: { type: 'dashed', width: 1, color, opacity: 0.6 },
                data: [{ yAxis: average }],
              },
            }),
      },
    ],
  };
}
