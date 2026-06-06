# AxGantt Widget — Implementation Guide

**Widget**: `mendix.axgantt.AxGantt`  
**Version**: 1.0.0  
**Date**: 2026-06-07  

---

## 1. Kiến trúc tổng quan

```
┌─────────────────────────────── MENDIX PAGE ────────────────────────────────┐
│                                                                             │
│  ┌──────────────────────┐    ┌─────────────────────────────────────────┐   │
│  │  Page datasource     │    │             AxGantt Widget              │   │
│  │  (Roadmap entity)    │    │                                         │   │
│  │                      │    │  Props (expressions):                   │   │
│  │  MF_BuildTaskJson ───┼───►│   taskListJson   ← String expression    │   │
│  │  MF_BuildScaleJson ──┼───►│   scaleJson      ← String expression    │   │
│  │  MF_BuildColumnsJson─┼───►│   columnsJson    ← String expression    │   │
│  │  MF_BuildMarkerJson ─┼───►│   markerJson     ← String expression    │   │
│  │                      │    │   roadmapNo      ← $Roadmap/DocNo       │   │
│  │  $Roadmap/DocNo ─────┼───►│   roadmapRevision← $Roadmap/Revision   │   │
│  │  $Roadmap/RevisedBy ─┼───►│   roadmapRevisedBy                     │   │
│  │  $Roadmap/RevisedAt ─┼───►│   roadmapRevisedAt                     │   │
│  └──────────────────────┘    │                                         │   │
│                               │  Actions:                               │   │
│  ┌──────────────────────┐    │   onTaskDbClick ─────────────────────┐  │   │
│  │  NF_ShowTaskDetail ◄─┼────┤   onTaskMove   ──────────────────┐   │  │   │
│  │  (show detail page)  │    │   onTaskResize ───────────────┐   │   │  │   │
│  └──────────────────────┘    │   onTaskCreate ────────────┐  │   │   │  │   │
│                               │   onTaskSelect             │  │   │   │  │   │
│  ┌──────────────────────┐    └────────────────────────────┼──┼───┼───┘  │   │
│  │  MF_PersistTaskMove ◄┼─────────────────────────────────┼──┘   │      │   │
│  │  (commit + refresh)  │◄────────────────────────────────┼──────┘      │   │
│  └──────────────────────┘                                 │             │   │
│                               NF_ShowTaskDetail ◄─────────┘             │   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data flow chi tiết

```
USER ACTION                    WIDGET INTERNAL              MENDIX BACKEND
──────────────────────────────────────────────────────────────────────────
Page load
  │
  ├─► MF_BuildTaskListJson()
  │     (Retrieve tasks từ DB)
  │     (Serialize → JSON string) ──► taskListJson expr
  │                                         │
  │                               useJsonDataSync()
  │                               parseTaskListJson()
  │                               (validate + parse)
  │                                         │
  │                               JsonDataStore.model
  │                                         │
  │                               GanttEngine.parse()
  │                                         │
  │                               dhtmlx render ──────────► [Chart visible]
  │
User double-clicks task bar
  │
  ├─► eventBridge.onTaskDblClick()
  │     build TaskEventContext:
  │     { taskId, taskLabel, start, end, progress, level }
  │     → JsonDataStore.lastActionContext
  │
  ├─► onTaskDbClick.execute() ───────────────────────────► NF_ShowTaskDetail()
  │                                                             │
  │                                                         Retrieve task by TaskKey
  │                                                         Open task detail page
  │                                                         User edits + Save
  │                                                             │
  │                                                         MF_SaveTask()
  │                                                           commit entity
  │                                                           re-run MF_BuildTaskListJson
  │                                                           refresh page
  │                                                             │
  │◄────────────────────── taskListJson expr updates ◄─────────┘
  │
  chart re-renders automatically
  │
User drags task bar
  │
  ├─► onBeforeTaskDrag() → save snapshot
  │
  ├─► onAfterTaskDrag()
  │     build TaskChangeContext:
  │     { taskId, changeType:"move",
  │       start, end,
  │       previousStart, previousEnd }
  │     → JsonDataStore.lastActionContext (optimistic update)
  │
  ├─► onTaskMove.execute() ──────────────────────────────► MF_PersistTaskMove()
  │                                                             │
  │           ┌─ if MF throws / returns "cancel" ◄────── Check version / commit
  │           │                                           Re-run build JSON
  │           ▼                                           Refresh page
  │     ROLLBACK:
  │     GanttEngine.rollbackTask()
  │     restore previous dates
  │     show error toast
```

---

## 3. JSON Schemas

### 3.1 `taskListJson` — **bắt buộc**

```json
{
  "tasks": [
    {
      "id":       "TASK-001",
      "text":     "Product Alpha",
      "start":    "2026-02-02",
      "end":      "2026-05-18",
      "duration": 30,
      "parent":   "PHASE-001",
      "type":     "task",
      "open":     true,
      "progress": 0.35,
      "readonly": false,
      "color":    "#4F46E5",
      "level":    "product",
      "owner":    "nguyen.van.a",
      "status":   "In Progress"
    }
  ],
  "links": [
    {
      "id":     "LN-1",
      "source": "TASK-001",
      "target": "TASK-002",
      "type":   0,
      "lag":    2
    }
  ]
}
```

#### Field reference

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `id` | string | ✅ | Unique identifier |
| `text` | string | ✅ | Tên hiển thị trên chart |
| `start` | string (ISO date) | ✅ | `"YYYY-MM-DD"` |
| `end` | string (ISO date) | ⚠️ | Bắt buộc nếu không có `duration` |
| `duration` | number | ⚠️ | Số ngày (thay cho `end`) |
| `parent` | string | ❌ | `id` của task cha |
| `type` | string | ❌ | `"task"` \| `"project"` \| `"milestone"` |
| `open` | boolean | ❌ | Expand project row mặc định |
| `progress` | number | ❌ | 0.0 → 1.0 (35% = `0.35`) |
| `readonly` | boolean | ❌ | Khóa task, không cho drag |
| `color` | string | ❌ | Màu hex cho bar timeline |
| `level` | string | ❌ | `"portfolio"` \| `"program"` \| `"phase"` \| `"product"` \| `"task"` |
| *custom fields* | any | ❌ | Bất kỳ field nào thêm vào, hiện trong cột extra |

#### Link type reference

| `type` | Tên | Ý nghĩa |
|--------|-----|---------|
| `0` | Finish-to-Start (FS) | B bắt đầu sau khi A kết thúc |
| `1` | Start-to-Start (SS) | B bắt đầu khi A bắt đầu |
| `2` | Finish-to-Finish (FF) | B kết thúc khi A kết thúc |
| `3` | Start-to-Finish (SF) | B kết thúc sau khi A bắt đầu |

#### Validation errors

| Code | Điều kiện |
|------|-----------|
| `E001` | `tasks` array null, không phải JSON, hoặc rỗng |
| `E002` | `id` bị trùng |
| `E003` | `parent` trỏ đến id không tồn tại |
| `E004` | Hierarchy depth > 5 (warning, vẫn render) |
| `E005` | `start` không parse được → skip task |
| `W101` | Không có `end` lẫn `duration` → default 1 ngày |

---

### 3.2 `scaleJson` — optional (có default)

Nếu để trống hoặc `{}` → widget tự dùng default **năm + tuần W01–W53**.

```json
{
  "anchorYear": 2026,
  "weekLabelFormat": "W##",
  "scales": [
    { "unit": "year", "step": 1, "format": "year" },
    { "unit": "week", "step": 1, "format": "W##"  }
  ]
}
```

| `weekLabelFormat` | Hiển thị |
|-------------------|---------|
| `"W##"` | W01, W02, … W53 |
| `"T##"` | T01, T02, … (legacy) |

> **Lưu ý 2026:** ISO week year 2026 có **53 tuần** (Jan 1 là Thursday).

---

### 3.3 `columnsJson` — optional

```json
{
  "columns": [
    { "name": "text",   "label": "Project", "tree": true, "width": 280, "resize": true },
    { "name": "owner",  "label": "Owner",   "width": 130, "align": "left" },
    { "name": "status", "label": "Status",  "width": 100, "align": "center" }
  ]
}
```

| Field | Type | Mô tả |
|-------|------|-------|
| `name` | string | Tên field trong task object |
| `label` | string | Tiêu đề cột hiển thị |
| `tree` | boolean | `true` = cột có expand/collapse (chỉ dùng 1 cột) |
| `width` | number | Pixel width |
| `align` | string | `"left"` \| `"center"` \| `"right"` |
| `resize` | boolean | User có thể kéo thay đổi width |

> Custom columns chỉ hiện data nếu task object trong `taskListJson` có field tương ứng.

---

### 3.4 `markerJson` — optional, cần `enableMarker = true`

```json
{
  "markers": [
    {
      "start_date": "2026-06-07",
      "css":        "axgantt-marker",
      "text":       "Today",
      "title":      "Current date"
    },
    {
      "start_date": "2026-09-21",
      "css":        "axgantt-marker",
      "text":       "Tape-out",
      "title":      "DRAM Gen-X tape-out deadline"
    }
  ]
}
```

---

## 4. Action Context — dữ liệu widget truyền vào action

Widget set context vào `JsonDataStore.lastActionContext` **trước** khi gọi `action.execute()`.

### `TaskEventContext` — read-only actions

Dùng cho: `onTaskDbClick`, `onTaskSelect`, `onTaskCheck`, `onTaskUndo`

```typescript
{
  taskId:    string;   // id của task
  taskLabel: string;   // text hiển thị
  start:     string;   // ISO 8601, VD: "2026-02-02T00:00:00.000Z"
  end?:      string;
  progress?: number;   // 0.0 → 1.0
  parentId?: string;
  level?:    string;   // "portfolio"|"program"|"phase"|"product"|"task"
}
```

### `TaskChangeContext` — write actions

Dùng cho: `onTaskMove`, `onTaskResize`, `onTaskCreate`, `onTaskRowDrag`

```typescript
{
  taskId:          string;
  taskLabel:       string;
  start:           string;
  end?:            string;
  progress?:       number;
  parentId?:       string;
  level?:          string;
  changeType:      "move" | "resize" | "progress" | "create" | "rowDrag";
  previousStart?:  string;  // trước khi drag
  previousEnd?:    string;
  previousProgress?: number;
  previousParentId?: string;
  cancelled?:      boolean; // true khi widget rollback
}
```

> **Rollback:** Nếu `onTaskMove` microflow throw exception hoặc trả về Cancel → widget tự động restore task về `previousStart`/`previousEnd` và set `cancelled: true`.

---

## 5. Hướng dẫn Backend — Microflow / Nanoflow

### 5.1 Domain model gợi ý

```
Roadmap
  ├── DocumentNo    : String
  ├── Revision      : String
  ├── RevisedBy     : String
  ├── RevisedAt     : DateTime
  └── [1—*] RoadmapTask
              ├── TaskKey       : String  (unique key, dùng làm JSON id)
              ├── TaskName      : String
              ├── StartDate     : DateTime
              ├── EndDate       : DateTime
              ├── ParentKey     : String  (TaskKey của parent)
              ├── TaskType      : Enum    (Task / Project / Milestone)
              ├── HierarchyLevel: Enum    (Portfolio/Program/Phase/Product/Task)
              ├── Progress      : Decimal (0.0 – 1.0)
              ├── BarColor      : String  (hex, VD "#4F46E5")
              ├── IsReadOnly    : Boolean
              ├── Owner         : String
              └── Status        : String
```

---

### 5.2 `MF_BuildTaskListJson`

**Input:** `Roadmap`  
**Output:** `String` (JSON)

**Các bước:**

```
1. Retrieve list RoadmapTask WHERE RoadmapTask/Roadmap = $Roadmap
   ORDER BY: ParentKey ASC, StartDate ASC

2. Loop qua từng RoadmapTask → build JSON object string:
   {
     "id":       $Task/TaskKey,
     "text":     $Task/TaskName,
     "start":    formatDate($Task/StartDate, "yyyy-MM-dd"),
     "end":      formatDate($Task/EndDate,   "yyyy-MM-dd"),
     "parent":   $Task/ParentKey  (null nếu rỗng),
     "type":     mapEnum($Task/TaskType),        // "task"|"project"|"milestone"
     "open":     $Task/TaskType == Project,
     "progress": $Task/Progress,
     "color":    $Task/BarColor,
     "level":    mapEnum($Task/HierarchyLevel),  // "portfolio"|...|"task"
     "readonly": $Task/IsReadOnly,
     "owner":    $Task/Owner,
     "status":   $Task/Status
   }

3. Aggregate thành: {"tasks": [...], "links": []}

4. Return JSON string
```

> **Cách nhanh nhất:** Dùng Mendix **Export Mapping** → JSON. Tạo JSON Structure matching schema, map entity vào, gọi Export to JSON String.

---

### 5.3 `MF_BuildMarkerJson`

**Input:** `Roadmap`  
**Output:** `String` (JSON)

```
1. Retrieve danh sách milestones quan trọng cần đánh dấu
   (hoặc tính toán từ business logic)

2. Build JSON:
   {
     "markers": [
       { "start_date": "2026-06-07", "css": "axgantt-marker", "text": "Today" },
       ...
     ]
   }

3. Return string
```

---

### 5.4 `NF_ShowTaskDetail` — Nanoflow

**Trigger:** `onTaskDbClick`  
**Mục đích:** Mở trang detail để user xem/sửa task

```
1. Lấy taskId từ page parameter hoặc session variable
   ($currentObject nếu widget truyền qua, hoặc đọc context JSON)

2. Retrieve RoadmapTask WHERE TaskKey = taskId

3. Show page: Page_TaskDetail($RoadmapTask)

   Page_TaskDetail:
     - Input: RoadmapTask
     - Form: hiện TaskName, StartDate, EndDate, Progress, ...
     - Button "Save" → gọi MF_SaveTaskAndRefresh
     - Button "Cancel" → close page
```

---

### 5.5 `MF_SaveTaskAndRefresh`

**Input:** `RoadmapTask`  
**Mục đích:** Commit thay đổi + trigger widget re-render

```
1. Commit $RoadmapTask

2. Re-compute taskListJson:
   → Re-run MF_BuildTaskListJson($Roadmap)
   → Set page variable $TaskListJson = result

3. Close dialog / navigate về chart page
   → Page datasource refresh → taskListJson expression cập nhật → chart re-renders
```

---

### 5.6 `MF_PersistTaskMove`

**Trigger:** `onTaskMove`, `onTaskResize`  
**Mục đích:** Lưu ngày mới sau khi user drag/resize

```
1. Đọc context từ widget (truyền qua page parameter):
   taskId, start, end, previousStart, previousEnd, changeType

2. Retrieve RoadmapTask WHERE TaskKey = taskId

3. (Optional) Kiểm tra optimistic lock:
   IF $Task/ModifiedAt != previousModifiedAt
   THEN throw "Conflict: task was updated by another user"
        → Widget tự rollback về previous dates

4. Cập nhật:
   $Task/StartDate = parseDate(start)
   $Task/EndDate   = parseDate(end)
   $Task/ModifiedAt = [%CurrentDateTime%]

5. Commit $Task

6. Re-run MF_BuildTaskListJson → refresh page
   → taskListJson cập nhật → widget re-renders với ngày mới từ DB
```

> **Nếu MF throw exception:** Widget tự động rollback task về `previousStart`/`previousEnd` trên chart và show error toast. Không cần xử lý rollback phía Mendix.

---

## 6. Wiring trong Studio Pro

```
AxGantt widget properties:
┌──────────────────────────────────────────────────────────┐
│ DATA (JSON)                                              │
│   taskListJson   = MF_BuildTaskListJson($Roadmap)        │
│   scaleJson      = '{}'   ← empty = default year/week    │
│   columnsJson    = MF_BuildColumnsJson()                 │
│   markerJson     = MF_BuildMarkerJson($Roadmap)          │
│                                                          │
│ PM ROADMAP HEADER                                        │
│   roadmapNo        = $Roadmap/DocumentNo                 │
│   roadmapRevision  = $Roadmap/Revision                   │
│   roadmapRevisedBy = $Roadmap/RevisedBy                  │
│   roadmapRevisedAt = $Roadmap/RevisedAt                  │
│                                                          │
│ DISPLAY                                                  │
│   ganttHeight      = 700                                 │
│   defaultExpandTree= true                                │
│   enableMarker     = true                                │
│   ganttStartDate   = [%BeginOfCurrentYear%]              │
│   ganttEndDate     = [%EndOfCurrentYear%]                │
│                                                          │
│ INTERACTION                                              │
│   readOnly   = false                                     │
│   mayEdit    = $CurrentUser/CanEditRoadmap               │
│   dragMove   = true                                      │
│   dragResize = true                                      │
│   sort       = true                                      │
│                                                          │
│ EVENTS                                                   │
│   onTaskDbClick  = NF_ShowTaskDetail                     │
│   onTaskMove     = MF_PersistTaskMove                    │
│   onTaskResize   = MF_PersistTaskMove                    │
│   onTaskCreate   = MF_CreateNewTask                      │
│   onTaskSelect   = NF_SetSelectedTask                    │
│   onTaskRowDrag  = MF_PersistTaskMove                    │
└──────────────────────────────────────────────────────────┘
```

---

## 7. Demo JSON hoàn chỉnh

### `taskListJson`

```json
{
  "tasks": [
    {
      "id": "PF-2026",
      "text": "Samsung DS PM Roadmap 2026",
      "start": "2026-01-01",
      "end": "2026-12-31",
      "type": "project",
      "open": true,
      "level": "portfolio"
    },
    {
      "id": "PRG-AL",
      "text": "Advanced Logic",
      "parent": "PF-2026",
      "start": "2026-01-01",
      "end": "2026-12-31",
      "type": "project",
      "open": true,
      "level": "program"
    },
    {
      "id": "PH-AL-1",
      "text": "Phase I",
      "parent": "PRG-AL",
      "start": "2026-01-05",
      "end": "2026-06-30",
      "type": "project",
      "open": true,
      "level": "phase"
    },
    {
      "id": "PROD-ALPHA",
      "text": "Product Alpha",
      "parent": "PH-AL-1",
      "start": "2026-02-02",
      "end": "2026-05-18",
      "type": "task",
      "progress": 0.35,
      "color": "#4F46E5",
      "level": "product",
      "owner": "nguyen.van.a",
      "status": "In Progress"
    },
    {
      "id": "TSK-FREEZE",
      "text": "Design freeze",
      "parent": "PROD-ALPHA",
      "start": "2026-02-23",
      "end": "2026-02-23",
      "type": "milestone",
      "level": "task"
    },
    {
      "id": "PROD-BETA",
      "text": "Product Beta",
      "parent": "PH-AL-1",
      "start": "2026-04-28",
      "end": "2026-08-16",
      "type": "task",
      "progress": 0.12,
      "color": "#7C3AED",
      "level": "product",
      "owner": "le.van.c",
      "status": "Planning"
    },
    {
      "id": "PH-AL-2",
      "text": "Phase II",
      "parent": "PRG-AL",
      "start": "2026-07-06",
      "end": "2026-12-31",
      "type": "project",
      "open": true,
      "level": "phase"
    },
    {
      "id": "PROD-GAMMA",
      "text": "Product Gamma",
      "parent": "PH-AL-2",
      "start": "2026-07-06",
      "end": "2026-11-09",
      "type": "task",
      "progress": 0.05,
      "color": "#6366F1",
      "level": "product",
      "owner": "pham.thi.d",
      "status": "Not Started"
    },
    {
      "id": "PRG-MEM",
      "text": "Memory Technology",
      "parent": "PF-2026",
      "start": "2026-01-01",
      "end": "2026-12-31",
      "type": "project",
      "open": true,
      "level": "program"
    },
    {
      "id": "PH-MEM-1",
      "text": "Phase I",
      "parent": "PRG-MEM",
      "start": "2026-01-05",
      "end": "2026-12-31",
      "type": "project",
      "open": true,
      "level": "phase"
    },
    {
      "id": "PROD-DRAM",
      "text": "DRAM Gen-X",
      "parent": "PH-MEM-1",
      "start": "2026-03-09",
      "end": "2026-10-05",
      "type": "task",
      "progress": 0.22,
      "color": "#0891B2",
      "level": "product",
      "owner": "tran.thi.b",
      "status": "On Track"
    },
    {
      "id": "TSK-RTL",
      "text": "RTL complete",
      "parent": "PROD-DRAM",
      "start": "2026-04-13",
      "end": "2026-04-13",
      "type": "milestone",
      "level": "task"
    },
    {
      "id": "TSK-TAPEOUT",
      "text": "Tape-out",
      "parent": "PROD-DRAM",
      "start": "2026-09-21",
      "end": "2026-09-21",
      "type": "milestone",
      "level": "task"
    }
  ],
  "links": [
    { "id": "LN-1", "source": "TSK-FREEZE", "target": "PROD-BETA",   "type": 0 },
    { "id": "LN-2", "source": "TSK-RTL",    "target": "TSK-TAPEOUT", "type": 0 }
  ]
}
```

### `columnsJson` — với cột custom

```json
{
  "columns": [
    { "name": "text",   "label": "Project", "tree": true, "width": 280, "resize": true },
    { "name": "owner",  "label": "Owner",   "width": 130, "align": "left" },
    { "name": "status", "label": "Status",  "width": 100, "align": "center" }
  ]
}
```

### `scaleJson` — năm + tuần W01-W53

```json
{
  "anchorYear": 2026,
  "weekLabelFormat": "W##",
  "scales": [
    { "unit": "year", "step": 1, "format": "year" },
    { "unit": "week", "step": 1, "format": "W##"  }
  ]
}
```

### `markerJson`

```json
{
  "markers": [
    {
      "start_date": "2026-06-07",
      "css":        "axgantt-marker",
      "text":       "Today",
      "title":      "Current date"
    },
    {
      "start_date": "2026-02-23",
      "css":        "axgantt-marker",
      "text":       "Design freeze",
      "title":      "Product Alpha — design freeze (W08)"
    },
    {
      "start_date": "2026-09-21",
      "css":        "axgantt-marker",
      "text":       "Tape-out",
      "title":      "DRAM Gen-X tape-out deadline (W38)"
    }
  ]
}
```

---

## 8. Development local

### Bật mock data (không cần Mendix backend)

Trong widget properties, set:

```
useMockData = true
```

Widget sẽ load `axgantt-roadmap.mock.ts` với:
- 17 tasks, 5 levels, 2 programs
- PM header: `Msoc251030-155`, rev `3`, `mxadmin`
- 3 timeline markers
- 2 dependency links
- Timeline: 2026 W01 – W53

### Chạy dev server

```bash
corepack enable
corepack prepare pnpm@11.8.1 --activate
pnpm install
pnpm run dev
```

---

## 9. Checklist triển khai

| # | Việc cần làm | Ai làm |
|---|-------------|--------|
| 1 | Tạo entity `RoadmapTask` với các field theo mục 5.1 | Backend |
| 2 | Viết `MF_BuildTaskListJson` serialize JSON | Backend |
| 3 | Viết `MF_PersistTaskMove` commit + refresh | Backend |
| 4 | Viết `MF_SaveTaskAndRefresh` sau khi edit | Backend |
| 5 | Thêm widget AxGantt vào page | Frontend |
| 6 | Bind `taskListJson` = `MF_BuildTaskListJson($Roadmap)` | Frontend |
| 7 | Bind header props từ `Roadmap` entity | Frontend |
| 8 | Tạo `NF_ShowTaskDetail` mở page detail | Frontend |
| 9 | Wire `onTaskMove`/`onTaskResize` → `MF_PersistTaskMove` | Frontend |
| 10 | Wire `onTaskDbClick` → `NF_ShowTaskDetail` | Frontend |
| 11 | Set `readOnly`/`mayEdit` theo user role | Frontend |
| 12 | Test với `useMockData=true` trước khi kết nối DB | Dev |
| 13 | Bật `enableMarker=true` + bind `markerJson` | Frontend |
| 14 | Build widget: `pnpm run build` → import `.mpk` vào Studio | Dev |

---

## 10. Lưu ý quan trọng

### Thứ tự tasks trong JSON

Tasks phải được sắp xếp **parent trước child** (hoặc widget sẽ báo lỗi `E003`):

```json
[
  { "id": "PF-1",   "parent": null },    ✅ root trước
  { "id": "PRG-1",  "parent": "PF-1" },  ✅ level 2
  { "id": "PH-1",   "parent": "PRG-1" }, ✅ level 3
  { "id": "PRG-1",  "parent": "PF-1" },  ❌ KHÔNG đặt child trước parent
]
```

### Date format

Chỉ dùng `"YYYY-MM-DD"` cho `start`/`end` trong JSON:

```
✅ "2026-02-23"
❌ "23/02/2026"
❌ "Feb 23, 2026"
```

### Refresh chart sau khi save

Widget tự re-render khi expression `taskListJson` thay đổi. Đảm bảo:

1. Microflow commit entity
2. Re-run `MF_BuildTaskListJson`
3. Update page variable → expression cập nhật → widget nhận data mới

### Rollback tự động

Không cần xử lý rollback phía Mendix. Nếu `onTaskMove` microflow **throw exception** hoặc **trả về Cancel**:

- Widget tự restore ngày cũ trên chart
- Hiện error toast cho user
- `cancelled: true` được set trong context
