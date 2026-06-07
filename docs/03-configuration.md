# 3. Configuration

Widget có **5 property groups** trong `src/AxGantt.xml`.

## Group 1: General

| Property | Type | Default | Mô tả |
|----------|------|---------|-------|
| `class` | string | — | CSS class thêm vào root element |
| `style` | string | — | Inline style |
| `tabIndex` | integer | `0` | Focus order |
| `useMockData` | boolean | `false` | Load mock roadmap JSON thay Mendix expression |

## Group 2: PM Roadmap Header

Hiển thị thông tin tài liệu phía trên chart. Tất cả là `type="expression"`.

| Property | Return type | Mô tả |
|----------|-------------|-------|
| `roadmapNo` | String | Số hiệu tài liệu, VD: `Msoc251030-155` |
| `roadmapRevision` | String | Revision label, VD: `3` |
| `roadmapRevisedBy` | String | Tên user sửa lần cuối |
| `roadmapRevisedAt` | DateTime | Thời điểm revision |

**Bind ví dụ:**
```
roadmapNo        = $Roadmap/DocumentNo
roadmapRevision  = $Roadmap/Revision
roadmapRevisedBy = $Roadmap/RevisedBy
roadmapRevisedAt = $Roadmap/RevisedAt
```

## Group 3: Data (JSON)

Tất cả properties đều `type="expression"` trả về String (hoặc DateTime).

| Property | Return type | Required | Mô tả |
|----------|-------------|----------|-------|
| `taskListJson` | String | ✅ (hoặc mock) | JSON với tasks array + optional links array |
| `scaleJson` | String | ❌ | Timeline scale config. Empty/`{}` = default year+week |
| `columnsJson` | String | ❌ | Grid column definitions. Empty = 1 cột "Project" |
| `markerJson` | String | ❌ | Timeline markers. Cần `enableMarker=true` |
| `ganttStartDate` | DateTime | ❌ | Giới hạn trái của timeline |
| `ganttEndDate` | DateTime | ❌ | Giới hạn phải của timeline |
| `initialScroll` | DateTime | ❌ | Scroll tới ngày này khi load |

**Bind ví dụ:**
```
taskListJson  = MF_BuildTaskListJson($Roadmap)
scaleJson     = '{}'
columnsJson   = MF_BuildColumnsJson()
markerJson    = MF_BuildMarkerJson($Roadmap)
ganttStartDate = [%BeginOfCurrentYear%]
ganttEndDate   = [%EndOfCurrentYear%]
```

### Default khi để trống

| Property | Default behavior |
|----------|-----------------|
| `scaleJson` | `{ anchorYear: 2026, weekLabelFormat: "W##", scales: [year+week] }` |
| `columnsJson` | `{ columns: [{ name: "text", label: "Project", tree: true, width: 300 }] }` |
| `markerJson` | Không có marker |

## Group 4: Display

| Property | Type | Default | Mô tả |
|----------|------|---------|-------|
| `ganttWidth` | integer | `0` | Width px (0 = auto) |
| `ganttHeight` | integer | `600` | Height px |
| `defaultExpandTree` | boolean | `true` | Mở rộng project rows khi load |
| `showAddTaskButton` | boolean | `false` | Hiện nút + thêm task dhtmlx |
| `enableMarker` | boolean | `false` | Bật timeline markers từ `markerJson` |
| `autoFit` | boolean | `false` | Fit timeline vào tasks khi load |
| `autoScroll` | boolean | `true` | Auto-scroll khi date thay đổi |
| `fitTasks` | boolean | `false` | Zoom fit all tasks |

## Group 5: Interaction

### Permission model

```
readOnly = true  →  khóa tất cả (override mọi flag bên dưới)
mayEdit  = false →  tương đương readOnly=true
```

`effectiveReadOnly = readOnly || !mayEdit`

| Property | Type | Default | Mô tả |
|----------|------|---------|-------|
| `readOnly` | boolean | `false` | Khóa toàn bộ chỉnh sửa |
| `mayEdit` | boolean | `true` | Master edit permission gate |
| `dragMove` | boolean | `true` | Kéo task ngang (thay đổi ngày) |
| `dragProgress` | boolean | `true` | Kéo handle progress |
| `dragMultiple` | boolean | `true` | Multi-task drag |
| `dragResize` | boolean | `true` | Resize duration task |
| `gridResize` | boolean | `true` | Kéo thay đổi width cột grid |
| `resizeRows` | boolean | `true` | Kéo thay đổi chiều cao row |
| `sort` | boolean | `true` | Sắp xếp khi click tiêu đề cột |
| `clickDrag` | boolean | `false` | Tạo task bằng click-drag trên timeline |

## Group 6: Events (Actions)

Tất cả là `type="action"`. Xem chi tiết context objects tại [07-events-and-actions.md](./07-events-and-actions.md).

| Action | Trigger | Context type |
|--------|---------|--------------|
| `onTaskCreate` | Task mới được tạo | `TaskChangeContext` |
| `onTaskResize` | Resize duration xong | `TaskChangeContext` |
| `onTaskMove` | Drag move xong | `TaskChangeContext` |
| `onTaskDbClick` | Double-click task bar | `TaskEventContext` |
| `onTaskCheck` | Checkbox column toggle | `TaskEventContext` |
| `onTaskUndo` | Undo operation | `TaskEventContext` |
| `onTaskSelect` | Task selection thay đổi | `TaskEventContext` |
| `onTaskRowDrag` | Row reorder trong grid | `TaskChangeContext` |

> **Gợi ý:** `onTaskDbClick` → nanoflow mở page detail. `onTaskMove`/`onTaskResize` → microflow persist.

## Studio validation (editorConfig)

File: `src/AxGantt.editorConfig.ts`

| Code | Severity | Điều kiện |
|------|----------|-----------|
| S001 | warning | `useMockData=false` và `taskListJson` chưa bind |

## Cấu hình khuyến nghị

### Development / demo

```
useMockData      = true
ganttHeight      = 700
defaultExpandTree= true
enableMarker     = true
readOnly         = false
```

### Production — full interaction

```
useMockData      = false
taskListJson     = MF_BuildTaskListJson($Roadmap)
scaleJson        = '{}'
columnsJson      = MF_BuildColumnsJson()
markerJson       = MF_BuildMarkerJson($Roadmap)
ganttStartDate   = [%BeginOfCurrentYear%]
ganttEndDate     = [%EndOfCurrentYear%]
roadmapNo        = $Roadmap/DocumentNo
roadmapRevision  = $Roadmap/Revision
roadmapRevisedBy = $Roadmap/RevisedBy
roadmapRevisedAt = $Roadmap/RevisedAt
mayEdit          = $CurrentUser/CanEditRoadmap
dragMove         = true
dragResize       = true
onTaskDbClick    = NF_ShowTaskDetail
onTaskMove       = MF_PersistTaskMove
onTaskResize     = MF_PersistTaskMove
```

### Read-only viewer

```
readOnly         = true
taskListJson     = MF_BuildTaskListJson($Roadmap)
enableMarker     = true
markerJson       = MF_BuildMarkerJson($Roadmap)
```
