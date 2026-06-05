# 8. Development Guide

## Prerequisites

- Node.js >= 16
- pnpm
- Mendix Studio Pro 10.24.9+
- (Optional) Mendix project path for dev sync

## Setup

```bash
git clone <repo>
cd dhl-gantts
pnpm install
```

Configure Mendix project in `package.json`:

```json
{
  "config": {
    "projectPath": "/absolute/path/to/mendix/project",
    "mendixHost": "http://localhost:8080",
    "developmentPort": 3000
  }
}
```

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm run dev` | Watch build → `dist/`, sync to Mendix project |
| `pnpm run build` | Production build → `.mpk` |
| `pnpm run start` | Dev server (pluggable-widgets-tools) |
| `pnpm run lint` | ESLint |
| `pnpm run lint:fix` | Auto-fix lint |
| `pnpm run test:unit` | Jest unit tests |
| `pnpm run release` | Release build (after prerelease lint) |

Output package: `dist/1.0.0/mendix.DhlGanttChart.mpk`

## Project structure

```
dhl-gantts/
├── src/
│   ├── DhlGanttChart.tsx           # Widget entry
│   ├── DhlGanttChart.xml           # Property schema
│   ├── DhlGanttChart.editorConfig.ts
│   ├── DhlGanttChart.editorPreview.tsx
│   ├── components/                 # React UI
│   ├── engine/                     # dhtmlx wrapper & config
│   ├── dimensions/                 # Filter/slice logic
│   ├── adapters/                   # Mendix ↔ canonical mapping
│   ├── store/                      # MobX stores
│   ├── hooks/                      # React hooks
│   ├── mock/                       # Mock datasources
│   └── ui/                         # CSS
├── typings/                        # Generated prop types
├── specs/001-dhl-gantt-chart/      # Spec Kit artifacts
├── docs/                           # This documentation
└── package.json
```

## Development workflow

### 1. Mock-first development

```bash
pnpm run dev
```

Trong Mendix:
- Add widget to page
- `useMockData = true`
- `initialScale = week`
- Run locally (F5)

### 2. Change widget code

Edit TypeScript/React → dev watcher rebuilds → refresh Mendix page.

### 3. Test

```bash
pnpm run test:unit
pnpm run lint
```

Current tests:
- `src/dimensions/__tests__/weekTimeline.spec.ts`
- `src/mock/datasources/__tests__/performance.spec.ts`

### 4. Production build

```bash
pnpm run build
```

Import `.mpk` hoặc verify dev sync.

## Key extension points

### Thêm mock company

Edit `src/mock/datasources/tasks.mock.ts` → `PORTFOLIO[]`.

### Thêm dimension axis

1. Add key to `DimensionKey` in `dimensionTypes.ts`
2. Register in `DimensionRegistry.ts`
3. Add slicer logic in `dimensionSlicer.ts`
4. Add XML enum in `dimensionConfig.dimensionKey`
5. Add expression filter property if needed

### Thêm Mendix action

1. Add `<property key="onMyAction" type="action">` in XML
2. Add to `EventBridgeActions` interface
3. Handle in `eventBridge.ts`
4. Wire in `DhlGanttChart.tsx` → `GanttContainer`
5. Rebuild → typings regenerate

### Custom dhtmlx config

`advancedConfigJson` property — merge JSON vào gantt.config (validate S003).

### Custom scale/columns

- Executive: edit `executiveTimeline.ts`
- Standard: edit `scaleConfigs.ts` and `configBuilder.ts`

## MobX patterns

Stores created once per widget instance:

```typescript
// DhlGanttChart.tsx
const store = useMemo(() => createRootStore(), []);
return (
  <StoreProvider store={store}>
    <DhlGanttChartInner {...props} />
  </StoreProvider>
);
```

Components dùng `observer()` + `useDatasourceStore()` / `useDimensionStore()`.

## Gantt lifecycle

Hook: `src/hooks/useGanttLifecycle.ts`

```
mount container ref
  → wait !isLoading && hasData
  → engine.init(container)
  → engine.parse(slicedModel)
  → eventBridge.attach()

model/filter change
  → engine.parse(slicedModel)  // no re-init

unmount
  → eventBridge.detach()
  → engine.destroy()
```

**Quan trọng:** Không gọi `gantt.init()` khi `isLoading=true` — gây lỗi "Could not render widget".

## Editor preview

`DhlGanttChart.editorPreview.tsx` — Studio Pro design mode preview showing mode (Mock/Mendix) and scale.

`DhlGanttChart.editorConfig.ts` — validation warnings S001–S004.

## CSS theming

File: `src/ui/DhlGanttChart.css`

Key classes:
- `.dhl-gantt-filter-bar` — filter bar layout
- `.dhl-gantt-week-tab` — week tabs
- `.dhl-gantt-project-segment` — product chips
- `.dhl-gantt-row--{level}` — grid row styling
- `.dhl-gantt-bar--{level}` — task bar styling
- `.dhl-gantt-weekend` — weekend highlight

## Branch convention

Feature branch: `001-dhl-gantt-chart` (Spec Kit numbering).

Validate: `.cursor/skills/speckit-git-validate`

## Spec Kit commands

| Command | Purpose |
|---------|---------|
| `/speckit-specify` | Update feature spec |
| `/speckit-plan` | Generate plan |
| `/speckit-tasks` | Generate tasks.md |
| `/speckit-implement` | Execute tasks |

Artifacts: `specs/001-dhl-gantt-chart/`

## Dependencies

| Package | Version | Notes |
|---------|---------|-------|
| dhtmlx-gantt | ^9.1.4 | Commercial license for production |
| mobx | ^6.16.0 | State management |
| mobx-react-lite | ^4.1.1 | React bindings |
| classnames | ^2.5.1 | CSS class utility |
| react / react-dom | ^19.0.0 | Via resolutions |

## Type generation

Widget properties in XML → `typings/DhlGanttChartProps.d.ts` generated on build. Rebuild after XML changes.
