import { chartOption, compactLabel } from './option';

const categories = [
  { name: 'Mon', value: 0.2 },
  { name: 'Tue', value: 0.4 },
];
type Series = {
  type: string;
  data: unknown[];
  markLine?: { data: Array<{ yAxis: number }> };
  areaStyle?: object;
  showSymbol: boolean;
};
const seriesOf = (option: ReturnType<typeof chartOption>): Series => (option.series as Series[])[0]!;

describe('chartOption', () => {
  it('draws columns by default, one per category, in its color', () => {
    const option = chartOption(categories, {}, '#10b981');
    expect((option.xAxis as { data: string[] }).data).toEqual(['Mon', 'Tue']);
    expect(seriesOf(option)).toMatchObject({ type: 'bar', data: [0.2, 0.4], itemStyle: { color: '#10b981' } });
  });

  it('fades columns by their value with intensity', () => {
    const option = chartOption(categories, { intensity: true }, '#10b981');
    expect(seriesOf(option).data).toEqual([
      { value: 0.2, itemStyle: { opacity: 0.5 } },
      { value: 0.4, itemStyle: { opacity: 1 } },
    ]);
  });

  it('marks the mean with average', () => {
    expect(seriesOf(chartOption(categories, { average: true }, '#000')).markLine?.data).toEqual([
      { yAxis: 0.30000000000000004 },
    ]);
    expect(seriesOf(chartOption(categories, {}, '#000')).markLine).toBeUndefined();
  });

  it('draws an area as a filled line, with dots when asked', () => {
    const series = seriesOf(chartOption(categories, { display: 'area', points: true }, '#00ccff'));
    expect(series.type).toBe('line');
    expect(series.areaStyle).toBeDefined();
    expect(series.showSymbol).toBe(true);
    expect(series).toMatchObject({ symbol: 'circle', showAllSymbol: true });
  });

  it('lets columns fill their category, and sets the fill of an area', () => {
    expect((chartOption(categories, {}, '#000').series as Array<{ barMaxWidth?: number }>)[0]!.barMaxWidth).toBe(32);
    expect(
      (chartOption(categories, { maxBarWidth: 0 }, '#000').series as Array<{ barMaxWidth?: number }>)[0]!.barMaxWidth,
    ).toBeUndefined();
    expect(seriesOf(chartOption(categories, { display: 'area', areaOpacity: 0.06 }, '#000')).areaStyle).toEqual({
      opacity: 0.06,
    });
  });

  it('names the axes when asked', () => {
    const option = chartOption(
      categories,
      { xAxis: { label: 'Hour of Day' }, yAxis: { label: 'Occupancy Rate', min: 0 } },
      '#000',
    );
    expect(option.xAxis).toMatchObject({ name: 'Hour of Day' });
    expect(option.yAxis).toMatchObject({ name: 'Occupancy Rate', min: 0 });
  });
});

describe('a ranking lying across', () => {
  const zones = [
    { name: 'Palmetto Garage - Visitors and more', value: 5707 },
    { name: 'Arena Lot', value: 1400 },
  ];

  it('puts the names down the side, first on top, cut to 22 characters, and the values hidden but labelled', () => {
    const option = chartOption(zones, { orientation: 'horizontal', labels: true, format: { unit: 'usd' } }, '#2a78d6');
    expect(option.yAxis).toMatchObject({
      type: 'category',
      inverse: true,
      data: ['Palmetto Garage - Vis…', 'Arena Lot'],
    });
    expect(option.xAxis).toMatchObject({ type: 'value', show: false });
    const series = (
      option.series as Array<{ label: { formatter: (p: { value: number }) => string }; itemStyle: object }>
    )[0]!;
    expect(series.label.formatter({ value: 5707 })).toBe('$5.7k');
    expect(series.itemStyle).toMatchObject({ borderRadius: [0, 4, 4, 0] });
  });

  it('labels money short, as the console does', () => {
    expect(compactLabel(5707, { unit: 'usd' })).toBe('$5.7k');
    expect(compactLabel(12_400, { unit: 'usd' })).toBe('$12k');
    expect(compactLabel(1_250_000, { unit: 'usd' })).toBe('$1.3M');
    expect(compactLabel(680.4, { unit: 'usd' })).toBe('$680');
    expect(compactLabel(26, { unit: 'decimal', decimalPlaces: 0 })).toBe('26');
  });
});
