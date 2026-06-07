# 6. Timeline & Scale

## Tổng quan

Timeline configuration được truyền vào qua `scaleJson` expression. Nếu để trống hoặc `{}`, widget dùng default **năm + tuần W01–W53**.

## scaleJson schema

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

### Fields

| Field | Type | Default | Mô tả |
|-------|------|---------|-------|
| `anchorYear` | number | `2026` | Năm gốc cho ISO week calculation |
| `weekLabelFormat` | string | `"W##"` | Format label tuần |
| `scales` | ScaleUnit[] | year+week | Mảng các scale rows |

### ScaleUnit

| Field | Type | Mô tả |
|-------|------|-------|
| `unit` | string | `"year"` \| `"month"` \| `"week"` \| `"day"` |
| `step` | number | Bước nhảy (VD: 1 = từng tuần) |
| `format` | string | Format string hoặc preset |

### weekLabelFormat

| Giá trị | Hiển thị |
|---------|---------|
| `"W##"` | W01, W02, … W53 |
| `"T##"` | T01, T02, … (legacy format) |

## Default scale (khi scaleJson trống)

```typescript
export const DEFAULT_SCALE_PAYLOAD: ScalePayload = {
  anchorYear: 2026,
  weekLabelFormat: "W##",
  scales: [
    { unit: "year", step: 1, format: "year" },
    { unit: "week", step: 1, format: "W##" }
  ]
};
```

Kết quả hiển thị:

```
┌───────────────────────────────────────────────────────────┐
│                         2026                              │ ← year row
├──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┤
│W1│W2│W3│W4│W5│W6│W7│W8│W9│..│  │  │  │  │  │  │  │  │W53│ ← week row
└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘
```

## Lưu ý ISO week 2026

**2026 có 53 tuần** (ISO 8601):
- W01 2026: Jan 5 – Jan 11
- W53 2026: Dec 28 2026 – Jan 3 2027

Khi dùng `anchorYear: 2026`, widget tự tính đủ 53 weeks.

## Scale builder

File: `src/engine/scaleBuilder.ts`

Chuyển `ScalePayload` → cấu hình dhtmlx:

```typescript
buildDhtmlxScale(payload: ScalePayload): DhtmlxScaleConfig
```

Với `weekLabelFormat: "W##"`:
- dhtmlx formatter: `(date) => "W" + getIsoWeek(date).toString().padStart(2, "0")`

## Timeline range (ganttStartDate / ganttEndDate)

Widget props:

| Property | Type | Mô tả |
|----------|------|-------|
| `ganttStartDate` | DateTime | Giới hạn trái của visible range |
| `ganttEndDate` | DateTime | Giới hạn phải của visible range |

Nếu không set → dhtmlx tự tính range từ tasks.

**Khuyến nghị:**
```
ganttStartDate = [%BeginOfCurrentYear%]
ganttEndDate   = [%EndOfCurrentYear%]
```

## Initial scroll

Property `initialScroll` (DateTime): scroll tới ngày này khi load. Hữu ích khi muốn focus vào "hôm nay" hoặc một milestone cụ thể:

```
initialScroll = [%CurrentDateTime%]
```

## Timeline markers (markerJson)

Cần bật `enableMarker = true`.

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

### MarkerDef fields

| Field | Type | Mô tả |
|-------|------|-------|
| `start_date` | string | `YYYY-MM-DD` |
| `css` | string | CSS class thêm vào marker line |
| `text` | string | Label hiển thị trên marker |
| `title` | string | Tooltip khi hover |

### CSS tùy chỉnh marker

```css
/* src/ui/AxGantt.css */
.axgantt-marker {
  border-left: 2px dashed #D40511;
}
.axgantt-marker .gantt_marker_content {
  background: #D40511;
  color: #fff;
  font-size: 11px;
}
```

## Scale presets khác

### Tháng + tuần

```json
{
  "anchorYear": 2026,
  "weekLabelFormat": "W##",
  "scales": [
    { "unit": "month", "step": 1, "format": "%M %Y" },
    { "unit": "week",  "step": 1, "format": "W##"   }
  ]
}
```

### Quý + tháng

```json
{
  "scales": [
    { "unit": "year",  "step": 1, "format": "year"   },
    { "unit": "month", "step": 3, "format": "Q%q"    }
  ]
}
```

### Ngày (project chi tiết)

```json
{
  "scales": [
    { "unit": "month", "step": 1, "format": "%M" },
    { "unit": "day",   "step": 1, "format": "%d" }
  ]
}
```
