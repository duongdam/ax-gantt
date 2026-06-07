# 4. Mock Data

Mock data phục vụ phát triển và demo mà không cần Mendix backend.

**Giải thích chi tiết mọi field JSON:** [12. JSON Reference](./12-json-reference.md)  
**File export đầy đủ:** [`mock/axgantt-roadmap.mock.full.json`](../mock/axgantt-roadmap.mock.full.json)

## Bật mock mode

Widget property: `useMockData = true`

Khi bật, widget bỏ qua JSON expressions và load `src/mock/axgantt-roadmap.mock.ts`.

## Bundle mock

```typescript
// getAxGanttRoadmapMock()
{
  taskListJson: string,   // → tasks + links
  scaleJson: string,      // → timeline header năm/tuần
  columnsJson: string,    // → cột grid trái
  markerJson: string,     // → vạch mốc timeline
  ganttStartDate: string, // → clip timeline (widget prop)
  ganttEndDate: string,
  roadmapNo: string,      // → PM header (widget props)
  roadmapRevision: string,
  roadmapRevisedBy: string,
  roadmapRevisedAt: string
}
```

## Hierarchy (5 levels)

```
Portfolio (type=project, level=portfolio)
└── Program (type=project, level=program)
    └── Phase (type=project, level=phase)
        └── Product (type=task, level=product)
            └── Task / Milestone (type=task|milestone, level=task)
```

## Thống kê mock (2025–2028)

| Metric | Giá trị |
|--------|---------|
| Timeline | 2025-01-01 → 2028-12-31 |
| Total tasks | 35 |
| Programs | 5 (2025 Foundation, 2026 AL + Memory, 2027 AI, 2028 Fab) |
| Links | 5 (Finish-to-Start) |
| Timeline markers | 6 |
| Scale | year + week (`W##` → Tuần 01…) |
| Columns | 1 (`Project`, tree) |
| Header | Msoc251030-155, rev 3, mxadmin |

## Ví dụ task

```json
{
  "id": "PROD-ALPHA",
  "text": "Product Alpha",
  "start": "2026-02-02",
  "end": "2026-05-18",
  "parent": "PH-AL-1",
  "type": "task",
  "progress": 0.35,
  "color": "#4F46E5",
  "level": "product"
}
```

## Links mock

| Link | Source | Target |
|------|--------|--------|
| LN-1 | TSK-FREEZE | PROD-BETA |
| LN-2 | TSK-RTL | TSK-TAPEOUT |
| LN-3 | TSK-2025-GO | PROD-ALPHA |
| LN-4 | TSK-GAMMA-GA | PROD-2027-NPU |
| LN-5 | TSK-2027-GA | PROD-2028-FAB |

## Markers mock

| text | Date |
|------|------|
| Arch review | 2025-04-14 |
| Design freeze | 2026-02-23 |
| Tape-out | 2026-09-21 |
| Silicon | 2027-05-18 |
| Groundbreak | 2028-04-17 |
| Year close | 2026-12-28 |

## scaleJson mock

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

## columnsJson mock

```json
{
  "columns": [
    { "name": "text", "label": "Project", "tree": true, "width": 300, "resize": true }
  ]
}
```

## Mở rộng mock

1. Edit `src/mock/axgantt-roadmap.mock.ts`
2. Export: `mock/axgantt-roadmap.mock.full.json`
3. Parent trước child trong `tasks[]`
4. `pnpm run dev` + refresh page
