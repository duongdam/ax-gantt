# 7. Events & Actions

Widget expose Mendix **action** properties. Trước khi `execute()`, widget set context object vào `DatasourceStore.lastActionContext`.

Contract đầy đủ: [mendix-action-context.md](../specs/001-dhl-gantt-chart/contracts/mendix-action-context.md)

## Action catalog

| Action property | Trigger | Context type |
|-----------------|---------|--------------|
| `onTaskClick` | Click task bar | TaskEventContext |
| `onTaskDblClick` | Double-click task | TaskEventContext |
| `onTaskSelected` | Task selected | TaskEventContext |
| `onBeforeTaskChange` | Before drag/resize/edit | TaskChangeContext |
| `onTaskChanged` | After successful edit | TaskChangeContext |
| `onTaskCreated` | Task created | TaskCreatedContext |
| `onTaskDeleted` | Task deleted | TaskDeletedContext |
| `onLinkCreated` | Link drawn | LinkEventContext |
| `onLinkDeleted` | Link removed | LinkEventContext |
| `onLinkValidationFailed` | Circular/invalid link | LinkValidationContext |
| `onResourceClick` | Click resource row | ResourceEventContext |
| `onScaleChanged` | Scale/zoom change | ScaleEventContext |
| `onDimensionFilterChanged` | Filter bar change | DimensionFilterContext |
| `onDataParseError` | Parse validation error | ErrorEventContext |

## Context objects

### TaskEventContext

```typescript
interface TaskEventContext {
  taskId: string;
  taskLabel: string;
  siteCode?: string;
  sourceSystem?: string;
  start: string;       // ISO 8601
  end?: string;
  progress?: number;
  entityType: "task";
}
```

### TaskChangeContext

Extends TaskEventContext:

```typescript
interface TaskChangeContext extends TaskEventContext {
  changeType: "move" | "resize" | "progress" | "text" | "type" | "parent" | "create" | "delete";
  previousStart?: string;
  previousEnd?: string;
  previousProgress?: number;
  previousParentId?: string;
  cancelled?: boolean;
}
```

### LinkEventContext

```typescript
interface LinkEventContext {
  linkId: string;
  sourceTaskId: string;
  targetTaskId: string;
  linkType: 0 | 1 | 2 | 3;  // FS, SS, FF, SF
  lag?: number;
  entityType: "link";
}
```

### DimensionFilterContext

```typescript
interface DimensionFilterContext {
  dimensionKey: string;
  selectedValues: string[];
  crossFilterMode: "and" | "or";
  resultTaskCount: number;
  resultResourceCount: number;
}
```

### ErrorEventContext

```typescript
interface ErrorEventContext {
  code: string;      // E001, E002, W101, ...
  message: string;
  entityType?: string;
  entityId?: string;
}
```

## Detail dialog behavior

| Interaction | Dialog opens? |
|-------------|---------------|
| Click task **bar** on timeline | ✅ Yes (if `enableDetailDialog=true`) |
| Click task **row** in grid | ❌ No |
| Click resource row | ✅ Yes |
| Double-click task | `onTaskDblClick` only (no auto dialog) |

Detection logic (`eventBridge.ts`):

```typescript
event.target.closest(".gantt_task_line, .gantt_task_content, .gantt_milestone")
```

Dialog component: `src/components/DetailDialog.tsx`
- Hiển thị tất cả fields từ `SelectedGanttItem.raw`
- Escape / backdrop click để đóng
- Custom fields khi `detailDialogShowCustom=true`

## Edit flow chi tiết

### 1. Before drag

```
onBeforeTaskDrag:
  - Block if isLoading
  - Block if !features.isTaskEditable(task)
  - Save snapshot for rollback
  - setDragging(true)
```

### 2. During drag

dhtmlx handles visual update internally.

### 3. After drag/update

```
onAfterTaskUpdate / onAfterTaskDrag:
  1. Map dhtmlx task → GanttTask
  2. Optimistic update in DatasourceStore
  3. Set TaskChangeContext
  4. Call onBeforeTaskChange (if configured)
     → false = reject
  5. Version check (optimistic lock)
  6. Call onTaskChanged (async)
     → false/throw = rollback
  7. Clear snapshot on success
```

### 4. Rollback

```
datasource.updateTask(taskId, snapshot)
engine.rollbackTask(snapshot)
showUiMessage("Changes could not be saved...")
```

## Link events

### Create

1. User draws link between tasks
2. `onBeforeLinkAdd` — validate (not self-link, enableLinkDraw)
3. `onAfterLinkAdd` — add to store, fire `onLinkCreated`

### Circular dependency

dhtmlx fires `onCircularLinkError`:
- Toast: "Circular dependency detected. Link was not created." (E002)
- `onLinkValidationFailed` action

## Scale change

Toolbar (khi enabled) hoặc mousewheel zoom → `onScaleChanged`:

```typescript
interface ScaleEventContext {
  scale: "hour" | "day" | "week" | "month" | "quarter" | "year";
  scrollDate?: string;
  zoomLevel?: number;
  trigger: "toolbar" | "mousewheel" | "property";
}
```

## Microflow patterns

### onTaskClick — show custom page

```
1. Widget sets TaskEventContext
2. Microflow: retrieve Task by TaskId from context
3. Show page with Task detail
```

### onTaskChanged — persist edit

```
1. Read TaskChangeContext (taskId, changeType, start, end)
2. Retrieve Task entity
3. Validate business rules
4. Update StartDate, EndDate, Progress
5. Increment Version
6. Commit
7. Return true (or false to trigger rollback)
```

### onBeforeTaskChange — validation gate

```
1. Check user role / task status
2. Return false to cancel edit (widget rolls back)
```

## dhtmlx event mapping

| dhtmlx Event | Widget handler |
|--------------|----------------|
| `onTaskClick` | handleTaskClick |
| `onTaskDblClick` | handleTaskDblClick |
| `onBeforeTaskDrag` | handleBeforeTaskDrag |
| `onAfterTaskDrag` | handleAfterTaskDrag |
| `onBeforeTaskChanged` | handleBeforeTaskChanged |
| `onAfterTaskUpdate` | handleAfterTaskUpdate |
| `onAfterTaskAdd` | handleTaskCreated |
| `onAfterTaskDelete` | handleTaskDeleted |
| `onBeforeLinkAdd` | handleBeforeLinkAdd |
| `onAfterLinkAdd` | handleAfterLinkAdd |
| `onAfterLinkDelete` | handleAfterLinkDelete |
| `onCircularLinkError` | handleLinkValidationFailed |
| `onTaskRowClick` | handleResourceClick (resource store) |

EventBridge lifecycle: `attach()` on engine init, `detach()` on destroy.
