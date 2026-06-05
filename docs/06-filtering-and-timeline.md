# 6. Filtering & Timeline

## Executive timeline

Kích hoạt khi widget property `initialScale = week`.

### Dual-scale header

```
┌─────────────────────────────────────────────────────────┐
│  Phase I · 2026          │        Phase II · 2026      │  ← top (month, step=6)
├──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│  T1  │  T2  │  T3  │  T4  │  T5  │  T6  │  T7  │  T8  │  ← bottom (week, step=1)
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

| Scale | Unit | Format | Logic |
|-------|------|--------|-------|
| Top | month (step 6) | `Phase I · {year}` / `Phase II · {year}` | Jan–Jun = Phase I |
| Bottom | week | `T{n}` | ISO week index từ anchor year |

**Anchor year:** `EXECUTIVE_TIMELINE_ANCHOR_YEAR = 2026` (`src/engine/executiveTimeline.ts`)

Week index calculation:

```typescript
getWeekIndexFromDate(date, anchorYear)
// T1 = first ISO week starting from Jan 1 anchor year
```

### Grid presentation (executive)

| Column | Width | Content |
|--------|-------|---------|
| Portfolio / Product | 300px, tree | Task text, WBS expand |
| Week | 88px | `periodLabel` (e.g. T6–T52) |
| % | 48px | Progress (products only) |

### Visual styling by level

CSS classes từ `custom.level`:

| Level | Row class | Bar class | Bar text |
|-------|-----------|-----------|----------|
| company | `dhl-gantt-row--company` | `dhl-gantt-bar--company` | Hidden |
| program | `dhl-gantt-row--program` | `dhl-gantt-bar--program` | Hidden |
| product | `dhl-gantt-row--product` | `dhl-gantt-bar--product` | Visible |
| milestone | `dhl-gantt-row--milestone` | diamond marker | — |

Styles: `src/ui/DhlGanttChart.css`

### Standard scale (non-week)

Khi `initialScale` ≠ `week`:

- Scales từ `scaleConfigs.ts` (hour/day/month/quarter/year)
- Columns: Task, Start, Days, Site

## DimensionFilterBar

Component: `src/components/DimensionFilterBar.tsx`

UI gồm 2 tầng:

### 1. Week tabs (T1, T2, …)

- Generated bởi `getWeekBuckets(model)` — chỉ weeks có task overlap
- Click tab → `dimension.selectWeek(start, end)` → time slice
- Auto-select week đầu tiên on load
- Scroll chart tới week start (via GanttContainer callback)

Tab hiển thị:
- Label: `T{n}`
- Sub-label: date range (e.g. `Jan 6 – Jan 12`)

### 2. Product segments

Khi week active, hiện danh sách products/milestones overlap week đó:

- Label header: `Products · T{n}`
- Button **All** — clear segment filter
- Mỗi segment: product name + date range tooltip

Click segment → `dimension.selectProjectSegment(taskId)` — filter tree tới subtree của product đó (giữ ancestors).

## Dimension slicer engine

File: `src/dimensions/dimensionSlicer.ts`

### Dimension keys

```typescript
type DimensionKey =
  | "time"
  | "site"
  | "project"
  | "resource"
  | "sourceSystem"
  | "department"
  | "status";
```

### Filter application order

```
1. dimensionSlicer(filters, crossFilterMode, timeRange)
2. filterBySegmentRoot(segmentRootId)  — executive product filter
3. enrichTaskDimensions()              — add computed dimension values
```

### Cross-filter modes

| Mode | Logic |
|------|-------|
| `and` | Task phải match **tất cả** active dimension filters |
| `or` | Task match **bất kỳ** active filter |

Empty filter values = dimension không active (pass-through).

### Debounce

DimensionStore debounce **300ms** trước khi apply filters → tránh re-render liên tục khi user click nhiều chips.

### Server filter mode

`filterMode = server`:
- `getSlicedModel()` return full model unchanged
- Mendix datasource phải pre-filter data
- Dùng cho dataset lớn (>5000 tasks)

## Programmatic filtering (code)

```typescript
const dimension = useDimensionStore();

// Filter by site
dimension.setFilter("site", ["HS-01", "VN-02"]);

// Filter by source system
dimension.setFilter("sourceSystem", ["MES", "PPM"]);

// Cross-filter mode
dimension.setCrossFilterMode("and");

// Time range
dimension.setTimeRange(new Date("2026-03-01"), new Date("2026-03-31"));

// Week + product (executive UI)
dimension.selectWeek(weekStart, weekEnd);
dimension.selectProjectSegment("PROD-ZFOLD");

// Clear all
dimension.clearAllFilters();
```

## Expression filters (Mendix page)

Widget properties Group 16 — evaluated on page load / refresh:

| Expression | Effect |
|------------|--------|
| `filterSiteCodes` | `"HS-01,VN-02"` → site filter |
| `filterSourceSystems` | Source system filter |
| `filterDepartments` | Department filter |
| `filterStatuses` | Status filter |
| `filterDateFrom` / `filterDateTo` | Time range |
| `filterSearch` | Text search on task label |

## Grouping

`primaryGroupDimension` → GanttEngine grouping plugin:

| Value | Behavior |
|-------|----------|
| `none` | Standard WBS tree (parentId) |
| `site` | Group rows by siteCode |
| `project` | Group by root project |
| `sourceSystem` | Group by source system |
| `department` | Group by department |

Executive demo khuyến nghị `none` — hierarchy đã có sẵn trong mock.

## Scroll sync

Khi chọn week tab, `GanttContainer` gọi `engine.scrollToDate(week.start)` để đưa timeline tới tuần được chọn.

## Week timeline utilities

File: `src/dimensions/weekTimeline.ts`

| Function | Purpose |
|----------|---------|
| `getWeekBuckets(model)` | Build WeekBucket[] from task date range |
| `findWeekByTimeRange(weeks, from, to)` | Match active week |
| `getProjectSegmentsForWeek(model, week)` | Products/milestones in week |

Unit tests: `src/dimensions/__tests__/weekTimeline.spec.ts`
