# 4. Mock Data

Mock data phục vụ phát triển và demo mà không cần Mendix backend.

## Bật mock mode

Widget property: `useMockData = true`

Khi bật, widget bỏ qua tất cả JSON expressions và load `axgantt-roadmap.mock.ts` thay thế.

## File mock

File: `src/mock/axgantt-roadmap.mock.ts`

Export hàm `getAxGanttRoadmapMock()` trả về toàn bộ mock data:

```typescript
export function getAxGanttRoadmapMock(): AxGanttRoadmapMock {
  return {
    taskListJson: string,       // JSON tasks + links
    scaleJson: string,          // JSON scale config
    columnsJson: string,        // JSON columns
    markerJson: string,         // JSON markers
    roadmapNo: string,          // "Msoc251030-155"
    roadmapRevision: string,    // "3"
    roadmapRevisedBy: string,   // "mxadmin"
    roadmapRevisedAt: string,   // ISO datetime
  };
}
```

## Cấu trúc hierarchy (5 levels)

```
Portfolio (type=project, level=portfolio)
└── Program (type=project, level=program)
    └── Phase (type=project, level=phase)
        └── Product (type=task, level=product)
            └── Task / Milestone (type=task|milestone, level=task)
```

## Thống kê

| Metric | Giá trị |
|--------|---------|
| Levels | 5 (portfolio → program → phase → product → task) |
| Total tasks | ~17 |
| Programs | 2 (Advanced Logic, Memory Technology) |
| Phases | 3 (Phase I + Phase II + Phase I-Mem) |
| Products | 4 (Product Alpha, Beta, Gamma, DRAM Gen-X) |
| Milestones | 4 (Design freeze, RTL complete, Tape-out, ...) |
| Links | 2 (FS dependencies) |
| Timeline markers | 3 (Today, Design freeze, Tape-out) |
| Anchor year | 2026 (53 ISO weeks) |

## Cấu trúc mock task

```typescript
{
  "id":       "PROD-ALPHA",
  "text":     "Product Alpha",
  "start":    "2026-02-02",
  "end":      "2026-05-18",
  "parent":   "PH-AL-1",
  "type":     "task",
  "progress": 0.35,
  "color":    "#4F46E5",
  "level":    "product",
  "owner":    "nguyen.van.a",
  "status":   "In Progress"
}
```

## PM Roadmap Header mock

```
roadmapNo:        "Msoc251030-155"
roadmapRevision:  "3"
roadmapRevisedBy: "mxadmin"
roadmapRevisedAt: "2026-06-07T00:00:00.000Z"
```

## Dependency links mock

| Link | Source | Target | Type |
|------|--------|--------|------|
| LN-1 | TSK-FREEZE (Design freeze) | PROD-BETA (Product Beta) | FS (0) |
| LN-2 | TSK-RTL (RTL complete) | TSK-TAPEOUT (Tape-out) | FS (0) |

## Timeline markers mock

| Marker | Date | CSS |
|--------|------|-----|
| Today | 2026-06-07 | `axgantt-marker` |
| Design freeze | 2026-02-23 | `axgantt-marker` |
| Tape-out | 2026-09-21 | `axgantt-marker` |

## Scale config mock

```json
{
  "anchorYear": 2026,
  "weekLabelFormat": "W##",
  "scales": [
    { "unit": "year", "step": 1, "format": "year" },
    { "unit": "week", "step": 1, "format": "W##" }
  ]
}
```

## Columns config mock

```json
{
  "columns": [
    { "name": "text",   "label": "Project", "tree": true, "width": 280, "resize": true },
    { "name": "owner",  "label": "Owner",   "width": 130, "align": "left" },
    { "name": "status", "label": "Status",  "width": 100, "align": "center" }
  ]
}
```

## Cách dùng mock data trong code

`AxGanttInner` dùng mock khi `props.useMockData = true`:

```typescript
const headerProps = useMemo(() => {
  const mock = props.useMockData ? getAxGanttRoadmapMock() : null;
  return {
    roadmapNo: readDynamicString(props.roadmapNo) ?? mock?.roadmapNo,
    ...
  };
}, [props.useMockData, ...]);
```

`useJsonDataSync` tương tự — nếu mock thì dùng mock JSON strings thay vì expressions.

## Mở rộng mock data

1. Edit `src/mock/axgantt-roadmap.mock.ts`
2. Thêm tasks vào `taskListJson` — giữ đúng thứ tự parent trước child
3. Thêm links, markers nếu cần
4. Chạy `pnpm run dev` và refresh Mendix page
