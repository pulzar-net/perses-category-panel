# Category panel for Perses

`PulzrCategoryPanel` draws values by category rather than over time: occupancy by hour of the day, a weekday pattern, the busiest spaces. As columns, a line, an area, or a strip of cells with each value in it.

```yaml
kind: Panel
spec:
  plugin:
    kind: PulzrCategoryPanel
    spec:
      display: bar
      format: { unit: percent-decimal, decimalPlaces: 0 }
      color: '#10b981'
      intensity: true
      average: true
      xAxis: { label: Hour of Day }
      yAxis: { label: Occupancy Rate, min: 0 }
```

- Each series is a category, named by its formatted name and valued by its last value, in the order the query gives them; `sort` (`desc`, `asc`) and `limit` make a ranking. A datasource gives an hour-of-day profile or a ranking this way, one series per category. Series labelled `compare` (the period before) are left out.
- `display`: `bar` (columns, the default), `line`, `area`, or `cells`: a strip of squares, one per category, each with its value, the largest outlined.
- `color`: any CSS color; the theme's first series color without it.
- `intensity`: a column's or cell's opacity follows its value, the largest full and none below 0.15.
- `average`: a dashed line at the mean. `points`: a dot on each value of a line or area, every one.
- `areaOpacity`: an area's fill, 0.12 unless set. `maxBarWidth`: columns at most this wide in px, 32 unless set; 0 lets them fill their category.
- `format` formats the value axis, tooltips and cells (any Perses format). `xAxis.label`, `yAxis.label`, `yAxis.min` and `yAxis.max` as their names say.
- "No data" shows when no series has a value.

## Install

Put the archive (`PulzrCategoryPanel-<version>.tar.gz`, from the releases) in a folder listed in the Perses server's `plugin.archive_paths`, or `npm install @pulzr/perses-category-panel` to embed it.

## Development

```bash
npm install
npm test
percli plugin test-schemas
npm run build
percli plugin build
```

### Releasing

Set the new version in `package.json`, commit, then tag and push it:

```bash
git tag v0.2.0 && git push origin v0.2.0
```

The Release workflow tests and builds, publishes the package to npm with provenance, and attaches the Perses plugin archive and the npm tarball to a GitHub release.

## License

Apache 2.0.
