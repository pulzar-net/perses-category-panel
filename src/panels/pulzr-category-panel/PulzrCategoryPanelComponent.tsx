import { Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { EChart, formatValue, useChartsTheme } from '@perses-dev/components';
import { BarChart, LineChart } from 'echarts/charts';
import { GridComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import { use as registerECharts } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { Category } from './categories';
import { categoriesOf, intensity, peakIndex, valuesOf } from './categories';
import { chartOption } from './option';
import type { PulzrCategoryPanelOptions, PulzrCategoryPanelProps } from './pulzr-category-panel-types';

registerECharts([BarChart, LineChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer]);

/** A strip of cells, one per category, each with its value in it; the largest outlined. */
function Cells({
  categories,
  spec,
  color,
}: {
  categories: Category[];
  spec: PulzrCategoryPanelOptions;
  color: string;
}): ReactElement {
  const max = Math.max(0, ...valuesOf(categories));
  const peak = peakIndex(categories);
  const tiny = { fontSize: 7, lineHeight: 1, fontFeatureSettings: "'tnum' 1" } as const;
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
        gap: '2px',
        alignContent: 'center',
        height: '100%',
        px: '10px',
        boxSizing: 'border-box',
      }}
    >
      {categories.map((c, i) => (
        <Tooltip
          key={c.name}
          title={c.value === null ? c.name : `${c.name}: ${formatValue(c.value, spec.format)}`}
          disableInteractive
        >
          <Stack alignItems="center" gap="3px" minWidth={0}>
            <Box
              sx={{
                width: '100%',
                aspectRatio: '1',
                maxHeight: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor:
                  c.value === null
                    ? 'transparent'
                    : `color-mix(in srgb, ${color} ${Math.round((spec.intensity === false ? 1 : intensity(c.value, max)) * 100)}%, transparent)`,
                border: c.value === null ? 1 : 0,
                borderColor: 'divider',
                boxSizing: 'border-box',
                outline: i === peak ? `1px solid ${color}` : 'none',
                outlineOffset: 1,
              }}
            >
              <Typography component="span" sx={{ ...tiny, color: 'text.primary' }}>
                {c.value === null ? '' : formatValue(c.value, { ...spec.format, decimalPlaces: 0 })}
              </Typography>
            </Box>
            <Typography component="span" sx={{ ...tiny, color: 'text.secondary', whiteSpace: 'nowrap' }}>
              {c.name}
            </Typography>
          </Stack>
        </Tooltip>
      ))}
    </Box>
  );
}

/** Values by category: columns, a line or an area across them, or a strip of cells. */
export function PulzrCategoryPanelComponent({
  queryResults,
  spec,
  contentDimensions,
}: PulzrCategoryPanelProps): ReactElement {
  const theme = useTheme();
  const chartsTheme = useChartsTheme();
  const palette = chartsTheme.echartsTheme.color;
  const color =
    spec.color ?? (Array.isArray(palette) && typeof palette[0] === 'string' ? palette[0] : theme.palette.primary.main);
  const categories = useMemo(() => categoriesOf(queryResults, spec), [queryResults, spec]);
  const option = useMemo(() => chartOption(categories, spec, color), [categories, spec, color]);

  if (categories.length === 0) {
    return (
      <Stack height="100%" alignItems="center" justifyContent="center">
        <Typography color="text.secondary">No data</Typography>
      </Stack>
    );
  }
  if (spec.display === 'cells') return <Cells categories={categories} spec={spec} color={color} />;
  return (
    <EChart
      option={option}
      theme={chartsTheme.echartsTheme}
      sx={{ width: contentDimensions?.width ?? '100%', height: contentDimensions?.height ?? '100%' }}
    />
  );
}
