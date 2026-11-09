import type { FormatOptions } from '@perses-dev/components';
import { formatValue } from '@perses-dev/components';
import type { EChartsCoreOption } from 'echarts/core';

import type { Category } from './categories';
import { intensity, mean } from './categories';
import type { PulzrCategoryPanelOptions } from './pulzr-category-panel-types';

const NAME = { nameLocation: 'middle', nameTextStyle: { fontSize: 10 } } as const;

/** The ECharts option for columns, a line or an area across the categories. */
export function chartOption(categories: Category[], spec: PulzrCategoryPanelOptions, color: string): EChartsCoreOption {
  const display = spec.display ?? 'bar';
  const format: FormatOptions = spec.format ?? { unit: 'decimal' };
  const max = Math.max(0, ...categories.map((c) => c.value));
  const average = spec.average ? mean(categories) : undefined;
  const data = categories.map((c) =>
    spec.intensity && display === 'bar' ? { value: c.value, itemStyle: { opacity: intensity(c.value, max) } } : c.value,
  );
  return {
    grid: {
      top: 8,
      right: 8,
      bottom: spec.xAxis?.label ? 18 : 0,
      left: spec.yAxis?.label ? 18 : 0,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories.map((c) => c.name),
      boundaryGap: display === 'bar',
      axisTick: { show: false },
      ...(spec.xAxis?.label ? { ...NAME, name: spec.xAxis.label, nameGap: 22 } : {}),
    },
    yAxis: {
      type: 'value',
      min: spec.yAxis?.min,
      max: spec.yAxis?.max,
      axisLabel: { formatter: (v: number) => formatValue(v, format) },
      ...(spec.yAxis?.label ? { ...NAME, name: spec.yAxis.label, nameGap: 34 } : {}),
    },
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
