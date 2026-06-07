# 8. Development Guide

## Prerequisites

- Node.js >= 16 (tested on v24)
- pnpm (cài qua `npm i -g pnpm`)
- Mendix Studio Pro 10.24.9+
- (Optional) Mendix project path cho dev sync

## Setup

```bash
git clone <repo>
cd dhl-gantts
pnpm install
```

Configure Mendix project sync trong `package.json`:

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
| `pnpm run dev` | Watch build → sync to Mendix project |
| `pnpm run build` | Production build → `.mpk` |
| `pnpm run lint` | ESLint |
| `pnpm run lint:fix` | Auto-fix lint |
| `pnpm run test:unit` | Jest unit tests |
| `pnpm run release` | Release build (after prerelease lint) |

Output package: `dist/1.0.0/mendix.axgantt.AxGantt.mpk`

## Project structure

```
dhl-gantts/
├── src/
│   ├── AxGantt.tsx                  # Widget entry
│   ├── AxGantt.xml                  # Property schema
│   ├── AxGantt.editorConfig.ts      # Studio Pro validation
│   ├── AxGantt.editorPreview.tsx    # Design mode preview
│   ├── components/
│   │   ├── GanttContainer.tsx       # Orchestration, lifecycle
│   │   ├── PmRoadmapHeader.tsx      # Header component
│   │   ├── GanttEmptyState.tsx      # Empty state UI
│   │   ├── GanttErrorToast.tsx      # Error toast (antd)
│   │   └── LoadingOverlay.tsx       # Loading UI (antd Spin)
│   ├── engine/
│   │   ├── GanttEngine.ts           # dhtmlx wrapper
│   │   ├── configBuilder.ts         # Scale/columns/plugins
│   │   ├── eventBridge.ts           # Event → action
│   │   ├── scaleBuilder.ts          # ScalePayload → dhtmlx
│   │   ├── scaleConfigs.ts          # Default scale defs
│   │   ├── executiveTimeline.ts     # Executive timeline utils
│   │   └── plugins/markers.ts       # Marker plugin
│   ├── adapters/
│   │   ├── parseTaskListJson.ts     # Parse + validate taskListJson
│   │   ├── parseScaleJson.ts        # Parse scaleJson
│   │   ├── parseColumnsJson.ts      # Parse columnsJson
│   │   ├── parseMarkerJson.ts       # Parse markerJson
│   │   ├── mapAxGanttModel.ts       # AxGanttParsedModel → dhtmlx
│   │   ├── mapTasksFromGantt.ts     # dhtmlx task → GanttTask
│   │   └── actionContext.ts         # Build context objects
│   ├── store/
│   │   ├── JsonDataStore.ts         # Parsed data store (MobX)
│   │   ├── StoreContext.tsx         # React context + provider
│   │   └── types.ts                 # TypeScript types
│   ├── hooks/
│   │   ├── useJsonDataSync.ts       # JSON parse hook
│   │   ├── useGanttLifecycle.ts     # Gantt lifecycle hook
│   │   └── useAtlasTheme.ts         # antd theme hook
│   ├── mock/
│   │   └── axgantt-roadmap.mock.ts  # Mock data (5-level roadmap)
│   ├── types/
│   │   └── axganttRuntime.ts        # Runtime type helpers
│   └── ui/
│       └── AxGantt.css              # Widget CSS
├── typings/
│   └── AxGanttProps.d.ts            # Generated prop types
├── docs/                            # This documentation
├── specs/001-dhl-gantt-chart/       # Spec Kit artifacts
└── package.json
```

## Development workflow

### 1. Mock-first development

```bash
pnpm run dev
```

Trong Mendix Studio:
- Add **Ax Gantt** widget to page
- `useMockData = true`
- Run locally (F5)
- Refresh page sau mỗi code change

### 2. Connect Mendix backend

- `useMockData = false`
- Bind `taskListJson = MF_BuildTaskListJson($Roadmap)`
- Wire actions: `onTaskDbClick`, `onTaskMove`, etc.

### 3. Lint + test

```bash
pnpm run lint
pnpm run test:unit
```

### 4. Production build

```bash
pnpm run build
# → dist/1.0.0/mendix.axgantt.AxGantt.mpk
```

Import `.mpk` vào Mendix hoặc dùng dev sync.

## Dependencies

| Package | Version | Vai trò |
|---------|---------|---------|
| `dhtmlx-gantt` | `^9.1.4` | Gantt chart engine |
| `antd` | `^6.4.3` | UI components (toast, spin, config) |
| `mobx` | `^6.16.0` | State management |
| `mobx-react-lite` | `^4.1.1` | React bindings (isolateGlobalState: true) |
| `classnames` | `^2.5.1` | CSS class utilities |

**devDependencies:**

| Package | Version | Vai trò |
|---------|---------|---------|
| `react` | `18.2.0` | React 18 (compile/type-check) |
| `react-dom` | `18.2.0` | React DOM |
| `@types/react` | `^18.2.0` | TypeScript types |
| `@types/react-dom` | `^18.2.0` | TypeScript types |
| `mendix` | `11.10.0` | Mendix widget SDK types |
| `@mendix/pluggable-widgets-tools` | `^11.8.1` | Build tools |

> React 18 là **devDependency** — Mendix host cung cấp React runtime cho widget, không bundle vào `.mpk`.

## Gantt lifecycle

Hook: `src/hooks/useGanttLifecycle.ts`

```
mount container ref
  → wait !isLoading && hasData
  → engine.init(container, features, options)
  → engine.applyConfig(scale, columns)
  → engine.parse(model)
  → eventBridge.attach()

model/scale/columns change (JSON props update)
  → engine.applyConfig(scale, columns)
  → engine.parse(model)    // no re-init

unmount
  → eventBridge.detach()
  → engine.destroy()
```

> **Quan trọng:** Không gọi `gantt.init()` khi `isLoading=true` — gây lỗi "Could not render widget".

## MobX patterns

```typescript
// Stores tạo once per widget instance
const store = useMemo(() => createRootStore(), []);

// Component observe store
const MyComponent = observer(() => {
  const store = useJsonDataStore();
  return <div>{store.model.tasks.length}</div>;
});
```

`mobx-react-lite` được dùng với `isolateGlobalState: true` — tránh xung đột MobX với các widget khác trên cùng Mendix page.

## Thêm antd component

antd đã sẵn sàng qua `ConfigProvider`. Import trực tiếp:

```typescript
import { Button, Tooltip, Spin } from "antd";
```

Theme tự động kế thừa từ `useAtlasTheme()` (Atlas UI CSS variables).

## Thêm Mendix action mới

1. Thêm vào `AxGantt.xml`:
```xml
<property key="onMyAction" type="action" required="false">
  <caption>On my action</caption>
</property>
```

2. Rebuild → `typings/AxGanttProps.d.ts` tự generate

3. Wire trong `AxGanttInner`:
```typescript
const onMyActionAction = useCallback(
  () => executeAction(props.onMyAction),
  [executeAction, props.onMyAction]
);
```

4. Pass vào `GanttContainer` → `EventBridge`

## Thêm custom field vào task

Thêm field bất kỳ vào JSON task object:
```json
{ "id": "T1", "text": "...", "myCustomField": "value" }
```

Hiển thị trong cột grid: thêm vào `columnsJson`:
```json
{ "name": "myCustomField", "label": "My Field", "width": 120 }
```

dhtmlx tự lấy giá trị từ task object theo `name`.

## CSS theming

File: `src/ui/AxGantt.css`

Key classes:
- `.axgantt-root` — root container
- `.axgantt-marker` — timeline marker line
- `antd` components tự động theo theme token từ `useAtlasTheme`

## Type generation

Widget properties trong XML → `typings/AxGanttProps.d.ts` auto-generated khi build. Rebuild sau mỗi lần thay đổi XML.

## Editor preview

`AxGantt.editorPreview.tsx` — Studio Pro design mode hiện placeholder (mode: Mock/Mendix).

## Branch convention

Feature branch: `001-dhl-gantt-chart` (Spec Kit numbering).

## Spec Kit commands

| Command | Purpose |
|---------|---------|
| `/speckit-specify` | Update feature spec |
| `/speckit-plan` | Generate plan |
| `/speckit-tasks` | Generate tasks.md |
| `/speckit-implement` | Execute tasks |

Artifacts: `specs/001-dhl-gantt-chart/`
