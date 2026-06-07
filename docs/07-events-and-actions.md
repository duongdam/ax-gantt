# 7. Events & Actions

Widget expose **8 Mendix action properties**. Trước khi `execute()`, widget set context object vào `JsonDataStore.lastActionContext`.

## Action catalog

| Action property | Trigger | Context type | Write/Read |
|-----------------|---------|--------------|------------|
| `onTaskDbClick` | Double-click task bar | `TaskEventContext` | Read |
| `onTaskSelect` | Task selection thay đổi | `TaskEventContext` | Read |
| `onTaskCheck` | Checkbox column toggle | `TaskEventContext` | Read |
| `onTaskUndo` | Undo operation | `TaskEventContext` | Read |
| `onTaskMove` | Drag task xong | `TaskChangeContext` | Write |
| `onTaskResize` | Resize task xong | `TaskChangeContext` | Write |
| `onTaskCreate` | Task mới được tạo | `TaskChangeContext` | Write |
| `onTaskRowDrag` | Row reorder trong grid | `TaskChangeContext` | Write |

## Context objects

### TaskEventContext — read-only events

Dùng cho: `onTaskDbClick`, `onTaskSelect`, `onTaskCheck`, `onTaskUndo`

```typescript
interface TaskEventContext {
  taskId:    string;   // id của task trong JSON
  taskLabel: string;   // text hiển thị
  start:     string;   // ISO 8601: "2026-02-02T00:00:00.000Z"
  end?:      string;
  progress?: number;   // 0.0 → 1.0
  parentId?: string;
  level?:    string;   // "portfolio"|"program"|"phase"|"product"|"task"
}
```

### TaskChangeContext — write events

Dùng cho: `onTaskMove`, `onTaskResize`, `onTaskCreate`, `onTaskRowDrag`

```typescript
interface TaskChangeContext {
  taskId:            string;
  taskLabel:         string;
  start:             string;
  end?:              string;
  progress?:         number;
  parentId?:         string;
  level?:            string;
  changeType:        "move" | "resize" | "progress" | "create" | "rowDrag";
  previousStart?:    string;   // trước khi drag
  previousEnd?:      string;
  previousProgress?: number;
  previousParentId?: string;
  cancelled?:        boolean;  // true nếu widget đã rollback
}
```

## Rollback contract

**Write actions** (`onTaskMove`, `onTaskResize`, `onTaskCreate`, `onTaskRowDrag`) trả về `Promise<boolean>`:

| Kết quả | Hành vi widget |
|---------|----------------|
| Microflow thành công | Chart giữ ngày mới |
| Microflow throw exception | Widget rollback + error toast |
| Microflow trả về Cancel | Widget rollback + error toast |

Sau rollback, widget set `cancelled: true` trong context.

## Microflow patterns

### onTaskDbClick — mở detail page

```
1. Widget sets TaskEventContext { taskId, taskLabel, start, end, ... }
2. Nanoflow/Microflow:
   a. Retrieve RoadmapTask WHERE TaskKey = $latestContext.taskId
   b. Show page: Page_TaskDetail($RoadmapTask)
```

### onTaskMove / onTaskResize — persist dates

```
1. Widget sets TaskChangeContext {
     taskId, changeType: "move",
     start: "2026-03-15", end: "2026-06-30",
     previousStart: "2026-02-02", previousEnd: "2026-05-18"
   }
2. Microflow:
   a. Retrieve RoadmapTask WHERE TaskKey = taskId
   b. Validate (version, permissions...)
   c. Update StartDate, EndDate
   d. Commit
   e. Trigger page refresh (re-run taskListJson expression)
3. On exception → widget auto-rollback
```

### onTaskCreate — tạo mới

```
1. Widget sets TaskChangeContext { changeType: "create", start, end, parentId }
2. Microflow:
   a. Create new RoadmapTask entity
   b. Set StartDate, EndDate, ParentKey từ context
   c. Commit
   d. Trigger page refresh
```

### onTaskSelect — track selection

```
1. Widget sets TaskEventContext { taskId, taskLabel }
2. Nanoflow:
   a. Set page variable $SelectedTaskId = taskId
   b. Refresh sidebar / info panel
```

## dhtmlx event mapping

File: `src/engine/eventBridge.ts`

| dhtmlx Event | Widget Handler | Mendix Action |
|--------------|----------------|---------------|
| `onTaskDblClick` | handleTaskDblClick | `onTaskDbClick` |
| `onBeforeTaskDrag` | handleBeforeTaskDrag | — (save snapshot) |
| `onAfterTaskDrag` | handleAfterTaskDrag | `onTaskMove` |
| task resize | handleTaskResize | `onTaskResize` |
| `onAfterTaskAdd` | handleTaskCreated | `onTaskCreate` |
| `onTaskClick` | handleTaskSelect | `onTaskSelect` |
| `onRowDragEnd` | handleRowDragEnd | `onTaskRowDrag` |

EventBridge lifecycle: `attach()` on engine init, `detach()` on destroy.

## Action execution flow (write)

```
1. onBeforeTaskDrag
   → check features.isTaskEditable(task)
   → save snapshot: { id, start, end, progress }

2. onAfterTaskDrag
   → optimistic update: chart hiện ngày mới ngay
   → build TaskChangeContext
   → set JsonDataStore.lastActionContext

3. call action.execute() → Mendix microflow runs
   │
   ├── success → clear snapshot, giữ ngày mới
   └── fail    → rollbackTask(snapshot)
                 engine.setTask(id, { start: snapshot.start, end: snapshot.end })
                 showErrorToast("Changes could not be saved")
```

## Action execution flow (read)

```
1. onTaskDblClick
   → build TaskEventContext
   → set JsonDataStore.lastActionContext

2. call action.execute() → Mendix nanoflow opens page
   (no rollback needed)
```

## Không configure action

Nếu action không được wire (null):

```typescript
const executeAction = useCallback((action?: ActionValue) => {
  if (action?.canExecute) {
    action.execute?.();
  }
}, []);
```

Widget bỏ qua khi `action = undefined` — không throw lỗi.

## Kiểm tra canExecute

Widget check `action.canExecute` trước khi `execute()`. Đảm bảo microflow không bị block bởi security/page context khi widget call action.
