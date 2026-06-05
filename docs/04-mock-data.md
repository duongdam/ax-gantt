# 4. Mock Data

Mock data phục vụ phát triển và demo không cần Mendix domain model.

## Loader

File: `src/mock/datasources/index.ts`

```typescript
loadMockDatasource({
  delayMs: 800,      // simulated network delay
  shouldFail: false, // force L001 error
  scenario: "default" // default | empty | performance
})
```

Widget truyền options qua `mockOptions` trong `DhlGanttChart.tsx` (`delayMs: 600` mặc định trong code).

## Scenarios

| Scenario | File | Nội dung |
|----------|------|----------|
| `default` | `scenarios/multiSite.ts` | Executive portfolio — tasks, links, resources, assignments |
| `empty` | `scenarios/empty.ts` | Model rỗng — test empty state |
| `performance` | `scenarios/performance.ts` | 500 tasks generated — stress test |

## Executive portfolio (default)

### Thống kê

| Metric | Giá trị |
|--------|---------|
| Companies | 10 (CO-A … CO-J) |
| Tasks | ~42 + 2 milestones |
| Hierarchy | 3 levels: Company → Program → Product |
| Language | English labels |
| Anchor year | 2026 |
| Source file | `src/mock/datasources/tasks.mock.ts` |

### Cấu trúc hierarchy

```
Company (type=project, level=company)
  └── Program (type=project, level=program)
        └── Product (type=task, level=product)
Milestone (type=milestone, level=milestone)
```

### Danh sách companies

| ID | Label | Site | Programs |
|----|-------|------|----------|
| CO-A | Company A | HQ-A | Samsung Mobile, Honda Automotive |
| CO-B | Company B | HQ-B | EV Battery & Energy |
| CO-C | Company C — Display | HQ-C | Next-Gen OLED Panel Line |
| CO-D | Company D — Semiconductor | HS-01 | Fab 3nm Expansion |
| CO-E | Company E — Cloud & AI | HQ-E | Enterprise AI Platform |
| CO-F | Company F — Logistics | VN-02 | Smart Warehouse System |
| CO-G | Company G — Healthcare | KR-03 | Medical Imaging Devices |
| CO-H | Company H — Renewable Energy | HQ-H | Wind & Solar Power |
| CO-I | Company I — Retail Digital | HQ-I | Retail Digital Transformation |
| CO-J | Company J — Aerospace | HQ-J | Aviation Components |

### Ví dụ Company A

```
Company A
├── Samsung Mobile Device Development
│   ├── Samsung Z Fold        (Jun–Dec, 35%)
│   └── Samsung S26+          (Feb–Sep, 62%)
└── Honda Automotive Development
    ├── Honda CRV             (Mar–Nov, 28%)
    └── Honda Civic Hybrid    (Jan–Aug, 55%)
```

### Custom fields trên task

Mock tasks dùng `custom` object cho executive presentation:

```typescript
custom: {
  level: "company" | "program" | "product" | "milestone",
  periodLabel: "T1–T52" | "T6–T52" | "T28",  // week range label
  status: "planned" | "in_progress" | "completed",
  owner?: "Mobile PM"  // product level only
}
```

`periodLabel` được tính tự động qua `formatExecutivePeriodRange()` từ start/end dates.

### Milestones

| ID | Text | Parent | Week |
|----|------|--------|------|
| M-GATE | Gate review portfolio Q3 | CO-A | T28 |
| M-FAB | Fab 3nm readiness review | CO-D | T31 |

## Links mock

File: `src/mock/datasources/links.mock.ts`

Dependencies giữa products/programs across portfolio (FS links). Ví dụ: S26+ → Z Fold, Civic Hybrid → CRV.

## Resources mock

File: `src/mock/datasources/resources.mock.ts`

Resources theo site/department: PMs, engineers, equipment. Dùng cho resource timeline và over-allocation demo.

## Assignments mock

File: `src/mock/datasources/assignments.mock.ts`

Gán resource → product tasks với `value` (allocation units).

## Builder pattern

`tasks.mock.ts` dùng declarative builder:

```typescript
interface CompanyDef {
  id: string;
  text: string;
  color: string;
  siteCode: string;
  progress: number;
  status: "planned" | "in_progress" | "completed";
  programs: ProgramDef[];
}

// PORTFOLIO: CompanyDef[] → buildCompany() → GanttTask[]
export const MOCK_TASKS = [...PORTFOLIO.flatMap(buildCompany), ...MILESTONES];
```

Thêm company mới: thêm entry vào `PORTFOLIO[]` với programs/products.

## Performance scenario

`getPerformanceScenario(500)` tạo 500 flat tasks với ID `PERF-001` … `PERF-500`. **Không** dùng executive hierarchy — mục đích đo render performance và memory.

Unit test: `src/mock/datasources/__tests__/performance.spec.ts`

## Mở rộng mock data

1. Thêm `CompanyDef` vào `PORTFOLIO` trong `tasks.mock.ts`
2. Cập nhật `links.mock.ts` nếu cần dependencies mới
3. Cập nhật `resources.mock.ts` / `assignments.mock.ts` cho resource view
4. Chạy `pnpm run test:unit` và `pnpm run build`
5. Sync `.mpk` vào Mendix project

## Week buckets từ mock

`getWeekBuckets(model)` scan tất cả task dates, tạo week tabs T1…Tn chỉ cho weeks có ít nhất 1 task overlap. Filter bar auto-select week đầu tiên on load.

Product segments trong week: tasks có `custom.level === "product"` hoặc `type === "milestone"` overlap week đó.
