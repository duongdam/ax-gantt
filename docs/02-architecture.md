# 2. Architecture

## Tổng quan kiến trúc

Widget theo mô hình **JSON-driven**: dữ liệu vào dưới dạng JSON string expression, parse vào store, render qua dhtmlx adapter. Không có Mendix datasource trực tiếp.

```
┌──────────────────────────────────────────────────────┐
│                  AxGantt Widget                       │
│                                                       │
│  AxGantt.tsx (entry)                                  │
│    │                                                  │
│    ├── ConfigProvider (antd, atlas theme)             │
│    ├── StoreProvider (MobX)                           │
│    └── AxGanttInner                                   │
│          │                                            │
│          ├── PmRoadmapHeader                          │
│          └── GanttContainer                           │
│                │                                      │
│                ├── useJsonDataSync()   ← parse JSON   │
│                ├── useGanttLifecycle() ← init/parse   │
│                ├── LoadingOverlay                     │
│                ├── GanttEmptyState                    │
│                ├── [dhtmlx container div]             │
│                └── GanttErrorToast                    │
└──────────────────────────────────────────────────────┘
```

## Data flow

```
Mendix expression (String)
  taskListJson / scaleJson / columnsJson / markerJson
        │
        ▼
  useJsonDataSync()
  ┌─────────────────────────────────────┐
  │ parseTaskListJson()  → tasks, links │
  │ parseScaleJson()     → ScalePayload │
  │ parseColumnsJson()   → ColumnDef[]  │
  │ parseMarkerJson()    → MarkerDef[]  │
  └─────────────────────────────────────┘
        │
        ▼
  JsonDataStore.model (MobX observable)
        │
        ▼
  useGanttLifecycle()
  ┌─────────────────────────────────────┐
  │ configBuilder (scale + columns)     │
  │ GanttEngine.parse(model)            │
  └─────────────────────────────────────┘
        │
        ▼
  dhtmlx Gantt DOM render
```

## MobX Stores

### JsonDataStore

File: `src/store/JsonDataStore.ts`

| Trách nhiệm | Chi tiết |
|-------------|----------|
| Giữ parsed model | `AxGanttParsedModel` (tasks + links) |
| Scale config | `ScalePayload` từ `scaleJson` |
| Column config | `ColumnDef[]` từ `columnsJson` |
| Marker config | `MarkerDef[]` từ `markerJson` |
| Loading state | `isLoading`, `error` |
| Action context | `lastActionContext` — truyền sang Mendix action |

### StoreContext

File: `src/store/StoreContext.tsx`

```typescript
// Root store — tạo một lần per widget instance
const store = useMemo(() => createRootStore(), []);

return (
  <StoreProvider store={store}>
    <AxGanttInner {...props} />
  </StoreProvider>
);
```

## Component tree

```
AxGantt (entry)
└── WidgetErrorBoundary
    └── ConfigProvider (antd theme từ Atlas UI)
        └── StoreProvider (MobX)
            └── AxGanttInner (observer)
                ├── PmRoadmapHeader
                └── GanttContainer (observer)
                    ├── LoadingOverlay
                    ├── GanttEmptyState
                    ├── [dhtmlx div ref]
                    └── GanttErrorToast
```

## Antd Theme Integration

File: `src/hooks/useAtlasTheme.ts`

Widget sử dụng `ConfigProvider` của antd với theme token đọc từ CSS variables của Mendix Atlas UI:

```
Mendix Atlas UI (:root)       useAtlasTheme()        antd token
─────────────────────────────────────────────────────────────
--color-brand-primary    →    colorPrimary
--color-feedback-success →    colorSuccess
--color-feedback-danger  →    colorError
--color-text-default     →    colorText
--border-radius-default  →    borderRadius
--font-family-default    →    fontFamily
```

Fallback khi chạy ngoài Mendix: `#D40511` (DHL red), `4px`, `14px`.

## GanttEngine

File: `src/engine/GanttEngine.ts`

Wrapper quanh singleton `dhtmlx-gantt`:

| Method | Mục đích |
|--------|----------|
| `init(container, features, options)` | Khởi tạo DOM — chỉ khi container mounted và không loading |
| `parse(model, options)` | Parse AxGanttParsedModel vào chart |
| `applyConfig(scale, columns)` | Áp dụng scale + columns từ JSON config |
| `scrollToDate(date)` | Scroll timeline tới ngày |
| `rollbackTask(task)` | Khôi phục task sau edit fail |
| `destroy()` | Cleanup khi unmount |

**Deferred init:** `useGanttLifecycle` đợi `!isLoading` trước khi `init`, tránh lỗi render dhtmlx trên container rỗng.

## EventBridge

File: `src/engine/eventBridge.ts`

Map dhtmlx events → MobX actions → Mendix action callbacks:

| dhtmlx Event | Widget Handler | Mendix Action |
|--------------|----------------|---------------|
| `onTaskDblClick` | handleTaskDblClick | `onTaskDbClick` |
| `onBeforeTaskDrag` | handleBeforeTaskDrag | — (snapshot) |
| `onAfterTaskDrag` | handleAfterTaskDrag | `onTaskMove` |
| `onTaskDrag` (resize) | handleTaskResize | `onTaskResize` |
| `onAfterTaskAdd` | handleTaskCreated | `onTaskCreate` |
| `onTaskClick` | handleTaskSelect | `onTaskSelect` |
| `onRowDragEnd` | handleRowDragEnd | `onTaskRowDrag` |

**Rollback:** Nếu action promise resolve `false` hoặc throw → `engine.rollbackTask(snapshot)` + error toast.

## FeatureRegistry

File: `src/engine/FeatureRegistry.ts` (thay thế `src/engine/features.ts`)

Centralized feature flags từ widget properties:

```typescript
interface FeatureRegistryOptions {
  readOnly: boolean;
  enableDragMove: boolean;
  enableResize: boolean;
  enableProgressDrag: boolean;
  enableMultiselect: boolean;
  showGrid: boolean;
  showChart: boolean;
  enableLinkDraw: boolean;
  enableKeyboard: boolean;
  enableTooltips: boolean;
  showTodayMarker: boolean;
  highlightWeekends: boolean;
}
```

`readOnly=true` force-disable tất cả edit flags. `mayEdit=false` tương đương readOnly.

## Hooks

| Hook | File | Mục đích |
|------|------|----------|
| `useJsonDataSync` | `src/hooks/useJsonDataSync.ts` | Parse JSON props → JsonDataStore |
| `useGanttLifecycle` | `src/hooks/useGanttLifecycle.ts` | init/parse/destroy lifecycle |
| `useAtlasTheme` | `src/hooks/useAtlasTheme.ts` | Atlas UI CSS vars → antd token |

## Adapters

| File | Mục đích |
|------|----------|
| `src/adapters/parseTaskListJson.ts` | Parse + validate taskListJson |
| `src/adapters/parseScaleJson.ts` | Parse scaleJson → ScalePayload |
| `src/adapters/parseColumnsJson.ts` | Parse columnsJson → ColumnDef[] |
| `src/adapters/parseMarkerJson.ts` | Parse markerJson → MarkerDef[] |
| `src/adapters/mapAxGanttModel.ts` | AxGanttParsedModel → dhtmlx data |
| `src/adapters/mapTasksFromGantt.ts` | dhtmlx task → GanttTask (sau edit) |
| `src/adapters/actionContext.ts` | Build TaskEventContext / TaskChangeContext |

## File map

| Path | Vai trò |
|------|---------|
| `src/AxGantt.tsx` | Widget entry, props → stores, antd ConfigProvider |
| `src/AxGantt.xml` | Mendix property schema |
| `src/AxGantt.editorConfig.ts` | Studio Pro validation |
| `src/AxGantt.editorPreview.tsx` | Design mode preview |
| `src/components/GanttContainer.tsx` | Orchestration, lifecycle |
| `src/components/PmRoadmapHeader.tsx` | Header: DocNo, Revision, RevisedBy/At |
| `src/engine/GanttEngine.ts` | dhtmlx wrapper |
| `src/engine/configBuilder.ts` | Scale, columns, plugins config |
| `src/engine/eventBridge.ts` | Event → action mapping |
| `src/engine/scaleBuilder.ts` | Build dhtmlx scale từ ScalePayload |
| `src/engine/scaleConfigs.ts` | Default scale definitions |
| `src/store/JsonDataStore.ts` | Parsed data store |
| `src/store/StoreContext.tsx` | React context + provider |
| `src/store/types.ts` | TypeScript types cho toàn widget |
| `src/hooks/useJsonDataSync.ts` | JSON parse hook |
| `src/hooks/useGanttLifecycle.ts` | Gantt lifecycle hook |
| `src/hooks/useAtlasTheme.ts` | antd theme hook |
| `src/mock/axgantt-roadmap.mock.ts` | Mock data (5-level roadmap) |
| `src/ui/AxGantt.css` | CSS styles |
| `typings/AxGanttProps.d.ts` | Generated prop types |
