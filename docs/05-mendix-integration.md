# 5. Mendix Integration

## Tổng quan

Production mode: `useMockData = false`. Widget nhận JSON string từ Mendix microflow expression, parse, render chart. Tương tác người dùng trigger Mendix action callbacks để persist.

Widget **không dùng Mendix datasource** — chỉ dùng `type="expression"` (String) và `type="action"`.

## Domain model khuyến nghị

### Roadmap entity

| Attribute | Type | Mô tả |
|-----------|------|-------|
| `DocumentNo` | String | VD: `Msoc251030-155` |
| `Revision` | String | VD: `3` |
| `RevisedBy` | String | Username |
| `RevisedAt` | DateTime | Timestamp revision |

### RoadmapTask entity

| Attribute | Type | Widget JSON field |
|-----------|------|-------------------|
| `TaskKey` | String (unique) | `id` |
| `TaskName` | String | `text` |
| `StartDate` | DateTime | `start` (`YYYY-MM-DD`) |
| `EndDate` | DateTime | `end` (`YYYY-MM-DD`) |
| `ParentKey` | String | `parent` (TaskKey của parent) |
| `TaskType` | Enum | `type` (`task`/`project`/`milestone`) |
| `HierarchyLevel` | Enum | `level` (`portfolio`/`program`/`phase`/`product`/`task`) |
| `Progress` | Decimal | `progress` (0.0 – 1.0) |
| `BarColor` | String | `color` (hex) |
| `IsReadOnly` | Boolean | `readonly` |
| `Owner` | String | `owner` (custom field) |
| `Status` | String | `status` (custom field) |

Association: `Roadmap [1] — [*] RoadmapTask`

## Wiring trong Studio Pro

```
AxGantt widget properties:
┌──────────────────────────────────────────────────────────┐
│ PM ROADMAP HEADER                                        │
│   roadmapNo        = $Roadmap/DocumentNo                 │
│   roadmapRevision  = $Roadmap/Revision                   │
│   roadmapRevisedBy = $Roadmap/RevisedBy                  │
│   roadmapRevisedAt = $Roadmap/RevisedAt                  │
│                                                          │
│ DATA (JSON)                                              │
│   taskListJson   = MF_BuildTaskListJson($Roadmap)        │
│   scaleJson      = '{}'                                  │
│   columnsJson    = MF_BuildColumnsJson()                 │
│   markerJson     = MF_BuildMarkerJson($Roadmap)          │
│   ganttStartDate = [%BeginOfCurrentYear%]                │
│   ganttEndDate   = [%EndOfCurrentYear%]                  │
│                                                          │
│ INTERACTION                                              │
│   mayEdit        = $CurrentUser/CanEditRoadmap           │
│   dragMove       = true                                  │
│   dragResize     = true                                  │
│                                                          │
│ EVENTS                                                   │
│   onTaskDbClick  = NF_ShowTaskDetail                     │
│   onTaskMove     = MF_PersistTaskMove                    │
│   onTaskResize   = MF_PersistTaskMove                    │
│   onTaskCreate   = MF_CreateNewTask                      │
└──────────────────────────────────────────────────────────┘
```

## MF_BuildTaskListJson

**Input:** `Roadmap`
**Output:** `String` (JSON)

```
1. Retrieve list RoadmapTask WHERE RoadmapTask/Roadmap = $Roadmap
   ORDER BY: ParentKey ASC, StartDate ASC

2. Loop qua từng RoadmapTask → build JSON object:
   {
     "id":       $Task/TaskKey,
     "text":     $Task/TaskName,
     "start":    formatDate($Task/StartDate, "yyyy-MM-dd"),
     "end":      formatDate($Task/EndDate,   "yyyy-MM-dd"),
     "parent":   $Task/ParentKey  (empty string → omit),
     "type":     mapEnum($Task/TaskType),
     "open":     $Task/TaskType == Project,
     "progress": $Task/Progress,
     "color":    $Task/BarColor,
     "level":    mapEnum($Task/HierarchyLevel),
     "readonly": $Task/IsReadOnly,
     "owner":    $Task/Owner,
     "status":   $Task/Status
   }

3. Build root object: {"tasks": [...], "links": []}

4. Return JSON string
```

> **Cách nhanh:** Dùng Mendix **Export Mapping** → JSON. Tạo JSON Structure matching schema, map entity, gọi Export to JSON String.

> **Quan trọng:** Thứ tự tasks phải parent trước child (xem mục validation).

## MF_BuildMarkerJson

**Input:** `Roadmap` (hoặc không cần input)
**Output:** `String` (JSON)

```
1. Tính ngày Today
2. Retrieve RoadmapMilestone hoặc build from business logic

3. Build JSON:
   {
     "markers": [
       { "start_date": "2026-06-07", "css": "axgantt-marker", "text": "Today" },
       { "start_date": "2026-09-21", "css": "axgantt-marker", "text": "Tape-out" }
     ]
   }

4. Return string
```

## NF_ShowTaskDetail

**Trigger:** `onTaskDbClick`
**Mục đích:** Mở trang detail để xem/sửa task

```
1. Đọc taskId từ JsonDataStore.lastActionContext (TaskEventContext.taskId)
   → Widget đã set context trước khi gọi action

2. Retrieve RoadmapTask WHERE TaskKey = taskId

3. Show page: Page_TaskDetail($RoadmapTask)
   - Form: TaskName, StartDate, EndDate, Progress, ...
   - Button "Save" → MF_SaveTaskAndRefresh
   - Button "Cancel" → close page
```

## MF_SaveTaskAndRefresh

**Input:** `RoadmapTask`
**Mục đích:** Commit thay đổi + trigger widget re-render

```
1. Validate business rules

2. Commit $RoadmapTask

3. Close dialog / navigate về chart page

4. Page datasource refresh
   → MF_BuildTaskListJson re-run
   → taskListJson expression cập nhật
   → Widget re-renders tự động
```

## MF_PersistTaskMove

**Trigger:** `onTaskMove`, `onTaskResize`
**Mục đích:** Lưu ngày mới sau khi user drag/resize

```
1. Đọc context từ JsonDataStore.lastActionContext (TaskChangeContext):
   taskId, start, end, previousStart, previousEnd, changeType

2. Retrieve RoadmapTask WHERE TaskKey = taskId

3. (Optional) Optimistic lock check:
   IF $Task/ModifiedAt != previousModifiedAt
   THEN throw "Conflict: task was updated by another user"
        → Widget tự rollback về previous dates

4. Cập nhật:
   $Task/StartDate  = parseDate(start)
   $Task/EndDate    = parseDate(end)
   $Task/ModifiedAt = [%CurrentDateTime%]

5. Commit $Task

6. Page datasource refresh → widget re-renders với ngày từ DB
```

> **Rollback tự động:** Nếu microflow throw exception → widget restore task về `previousStart`/`previousEnd` và show error toast. Không cần xử lý rollback phía Mendix.

## Edit persistence flow

```
User drag task bar
        │
        ▼
onBeforeTaskDrag → save snapshot
        │
        ▼
onAfterTaskDrag
  → optimistic update (task hiện ngày mới)
  → build TaskChangeContext
  → call onTaskMove.execute()
        │
        ├── MF returns normally ──────────► chart giữ ngày mới
        │                                   Page refresh → confirm từ DB
        │
        └── MF throws / returns false ──► rollback task về snapshot
                                          error toast: "Changes could not be saved"
```

## Context entity (không bắt buộc NPE)

Với JSON-driven widget, **không cần** tạo non-persistent entity. Widget set context trực tiếp vào `JsonDataStore.lastActionContext` dưới dạng JavaScript object. Microflow đọc context qua page parameter hoặc `$latestSyncedObject` tùy cách triển khai.

Tuy nhiên, nếu cần pass context vào microflow parameter:
- Tạo NPE `GanttTaskContext` với các attributes: `TaskId`, `Start`, `End`, `ChangeType`, ...
- Widget sẽ populate object này trước `action.execute()`

## Refresh strategy

| Strategy | Cách làm |
|----------|----------|
| After edit | Microflow commit → page datasource refresh → expression re-evaluate |
| After detail save | Close page → navigate về chart → refresh |
| Manual refresh | Trigger page data source microflow |

## Import widget

```bash
pnpm run build
# → dist/1.0.0/mendix.axgantt.AxGantt.mpk
```

Import `.mpk` vào Mendix project → Add to page → Configure properties.

Hoặc dùng dev sync:

```json
"config": {
  "projectPath": "/absolute/path/to/mendix/project",
  "mendixHost": "http://localhost:8080",
  "developmentPort": 3000
}
```

```bash
pnpm run dev   # watch build + auto-sync
```
