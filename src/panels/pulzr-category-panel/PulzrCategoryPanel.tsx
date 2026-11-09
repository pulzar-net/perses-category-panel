import type { PanelPlugin } from '@perses-dev/plugin-system';

import type { PulzrCategoryPanelOptions, PulzrCategoryPanelProps } from './pulzr-category-panel-types';
import { PulzrCategoryPanelComponent } from './PulzrCategoryPanelComponent';
import { PulzrCategoryPanelSettingsEditor } from './PulzrCategoryPanelSettingsEditor';

export const PulzrCategoryPanel: PanelPlugin<PulzrCategoryPanelOptions, PulzrCategoryPanelProps> = {
  PanelComponent: PulzrCategoryPanelComponent,
  panelOptionsEditorComponents: [{ label: 'Settings', content: PulzrCategoryPanelSettingsEditor }],
  supportedQueryTypes: ['TimeSeriesQuery'],
  createInitialOptions: () => ({ display: 'bar' }),
};
