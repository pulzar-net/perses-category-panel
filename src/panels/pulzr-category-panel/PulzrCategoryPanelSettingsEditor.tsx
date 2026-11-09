import { FormControlLabel, MenuItem, Switch, TextField } from '@mui/material';
import { FormatControls, OptionsEditorColumn, OptionsEditorGrid, OptionsEditorGroup } from '@perses-dev/components';
import type { OptionsEditorProps } from '@perses-dev/plugin-system';
import type { ReactElement } from 'react';

import type { CategoryDisplay, PulzrCategoryPanelOptions } from './pulzr-category-panel-types';

const text = (v: string): string | undefined => (v.trim() ? v : undefined);
const number = (v: string): number | undefined => (v.trim() === '' || Number.isNaN(Number(v)) ? undefined : Number(v));

export function PulzrCategoryPanelSettingsEditor({
  value,
  onChange,
}: OptionsEditorProps<PulzrCategoryPanelOptions>): ReactElement {
  const toggle = (key: 'intensity' | 'average' | 'points', label: string): ReactElement => (
    <FormControlLabel
      control={
        <Switch
          checked={Boolean(value[key])}
          onChange={(e) => onChange({ ...value, [key]: e.target.checked || undefined })}
        />
      }
      label={label}
    />
  );
  return (
    <OptionsEditorGrid>
      <OptionsEditorColumn>
        <OptionsEditorGroup title="Display">
          <TextField
            select
            size="small"
            label="Draw as"
            value={value.display ?? 'bar'}
            onChange={(e) => onChange({ ...value, display: e.target.value as CategoryDisplay })}
          >
            <MenuItem value="bar">Columns</MenuItem>
            <MenuItem value="line">Line</MenuItem>
            <MenuItem value="area">Area</MenuItem>
            <MenuItem value="cells">Cells</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Color"
            helperText="Any CSS color. Empty: the first series color."
            value={value.color ?? ''}
            onChange={(e) => onChange({ ...value, color: text(e.target.value) })}
          />
          {toggle('intensity', 'Fade by value')}
          {toggle('average', 'Line at the average')}
          {toggle('points', 'Dots on a line')}
          <TextField
            size="small"
            type="number"
            label="Area opacity"
            value={value.areaOpacity ?? ''}
            slotProps={{ htmlInput: { min: 0, max: 1, step: 0.05 } }}
            onChange={(e) => onChange({ ...value, areaOpacity: number(e.target.value) })}
          />
          <TextField
            size="small"
            type="number"
            label="Column width, at most"
            helperText="px. 0: the whole category."
            value={value.maxBarWidth ?? ''}
            onChange={(e) => onChange({ ...value, maxBarWidth: number(e.target.value) })}
          />
        </OptionsEditorGroup>
        <OptionsEditorGroup title="Order">
          <TextField
            select
            size="small"
            label="Sort"
            value={value.sort ?? 'none'}
            onChange={(e) =>
              onChange({ ...value, sort: e.target.value === 'none' ? undefined : (e.target.value as 'desc' | 'asc') })
            }
          >
            <MenuItem value="none">As given</MenuItem>
            <MenuItem value="desc">Largest first</MenuItem>
            <MenuItem value="asc">Smallest first</MenuItem>
          </TextField>
          <TextField
            size="small"
            type="number"
            label="Limit"
            value={value.limit ?? ''}
            onChange={(e) => onChange({ ...value, limit: number(e.target.value) })}
          />
        </OptionsEditorGroup>
      </OptionsEditorColumn>
      <OptionsEditorColumn>
        <OptionsEditorGroup title="Format">
          <FormatControls
            value={value.format ?? { unit: 'decimal' }}
            onChange={(format) => onChange({ ...value, format })}
          />
        </OptionsEditorGroup>
        <OptionsEditorGroup title="Axes">
          <TextField
            size="small"
            label="Category axis label"
            value={value.xAxis?.label ?? ''}
            onChange={(e) => onChange({ ...value, xAxis: { ...value.xAxis, label: text(e.target.value) } })}
          />
          <TextField
            size="small"
            label="Value axis label"
            value={value.yAxis?.label ?? ''}
            onChange={(e) => onChange({ ...value, yAxis: { ...value.yAxis, label: text(e.target.value) } })}
          />
          <TextField
            size="small"
            type="number"
            label="Value axis min"
            value={value.yAxis?.min ?? ''}
            onChange={(e) => onChange({ ...value, yAxis: { ...value.yAxis, min: number(e.target.value) } })}
          />
          <TextField
            size="small"
            type="number"
            label="Value axis max"
            value={value.yAxis?.max ?? ''}
            onChange={(e) => onChange({ ...value, yAxis: { ...value.yAxis, max: number(e.target.value) } })}
          />
        </OptionsEditorGroup>
      </OptionsEditorColumn>
    </OptionsEditorGrid>
  );
}
