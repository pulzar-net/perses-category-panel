import type { FormatOptions } from '@perses-dev/components';
import type { PanelProps } from '@perses-dev/plugin-system';
import type { TimeSeriesData } from '@perses-dev/spec';

/** Columns, a line or an area across the categories, or a strip of cells with each value in it. */
export type CategoryDisplay = 'bar' | 'line' | 'area' | 'cells';

export interface PulzrCategoryPanelOptions {
  display?: CategoryDisplay;
  format?: FormatOptions;
  /** The color drawn in, any CSS color. The theme's first series color unless set. */
  color?: string;
  /** A column's or cell's opacity follows its value: the largest full, the smallest faint. */
  intensity?: boolean;
  /** A dashed line at the mean of the values. */
  average?: boolean;
  /** A dot on each value of a line or area. */
  points?: boolean;
  /** An area's fill opacity, 0 to 1: 0.12 unless set. */
  areaOpacity?: number;
  /** Columns at most this wide, in px: 32 unless set; 0 lets them fill their category. */
  maxBarWidth?: number;
  /** Largest first; as the query gives them unless set. */
  sort?: 'desc' | 'asc';
  /** At most this many categories, after sorting. */
  limit?: number;
  xAxis?: { label?: string };
  yAxis?: { label?: string; min?: number; max?: number };
}

export type PulzrCategoryPanelProps = PanelProps<PulzrCategoryPanelOptions, TimeSeriesData>;
