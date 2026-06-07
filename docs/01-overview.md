# 1. Overview

## Giới thiệu

**AxGantt** (`mendix.axgantt.AxGantt`) là Mendix pluggable widget bọc thư viện [dhtmlx Gantt 9](https://dhtmlx.com/docs/products/dhtmlxGantt/) để hiển thị **PM Roadmap** dạng gantt chart 5 tầng phân cấp. Widget được thiết kế theo kiến trúc **JSON-driven** — toàn bộ dữ liệu và cấu hình được truyền vào qua JSON string expressions, tương tác người dùng được xử lý qua Mendix action callbacks.

### Use cases chính

| Use case | Mô tả |
|----------|-------|
| **PM Roadmap** | Portfolio → Program → Phase → Product → Task trên timeline tuần (W01–W53) |
| **Year planning** | Timeline theo năm + ISO week (2026 = 53 tuần) |
| **Milestone tracking** | Markers và milestone tasks trên timeline |
| **Interactive scheduling** | Kéo/thả, resize, commit qua Mendix microflow |

## Tech stack

| Thành phần | Phiên bản |
|------------|-----------|
| Mendix | Studio Pro 10.24.9+ |
| React | 18.2.0 (devDependency) |
| TypeScript | Strict |
| State | MobX 6 + mobx-react-lite 4 |
| Chart | dhtmlx-gantt 9.1.4 |
| UI | Ant Design (antd) 6+ |
| Build | @mendix/pluggable-widgets-tools 11 |
| Package manager | pnpm 10.30.0 |

## Kiến trúc JSON-driven

Widget **không** dùng Mendix datasource lists. Thay vào đó:

```
Mendix Microflow/Expression
      │
      │  JSON String
      ▼
  taskListJson ─────────► parse ──► chart render
  scaleJson    ─────────► parse ──► timeline scale
  columnsJson  ─────────► parse ──► grid columns
  markerJson   ─────────► parse ──► timeline markers
```

Backend (Mendix) chịu trách nhiệm serialize entity → JSON string. Widget chịu trách nhiệm parse, validate, render.

## Tính năng

### Hiển thị & timeline

- Grid (trái) + chart timeline (phải) đồng bộ
- WBS tree 5 tầng: portfolio → program → phase → product → task
- Timeline theo năm + tuần ISO (W01–W53 hoặc T01–T53)
- PM Roadmap Header: số hiệu tài liệu, revision, người sửa, thời gian sửa
- Today marker, timeline markers tùy chỉnh từ `markerJson`

### Dữ liệu

- **Mock mode**: Load `axgantt-roadmap.mock.ts` — roadmap 5 tầng đầy đủ
- **Mendix mode**: Nhận JSON string từ microflow expression
- Validation errors/warnings với mã E001–E005, W101

### Tương tác

- Drag move, resize, progress drag (bật/tắt từng loại qua props)
- Double-click task → Mendix nanoflow mở detail page
- Row drag reorder
- Optimistic update + rollback khi microflow fail

### Events (8 actions)

`onTaskDbClick`, `onTaskMove`, `onTaskResize`, `onTaskCreate`, `onTaskSelect`, `onTaskRowDrag`, `onTaskCheck`, `onTaskUndo`

## Quick start (mock mode)

1. Thêm widget **Ax Gantt** vào page
2. **Use mock data** = `true`
3. Run locally (F5)

Kết quả: PM Roadmap với 5-level hierarchy, timeline W01–W53 2026, PM header.

## Giới hạn hiện tại (v1)

| Mục | Trạng thái |
|-----|------------|
| Resources / Assignments | Không có trong v1 (JSON-driven chỉ tasks + links) |
| DimensionFilterBar | Đã bỏ — không có dimension slicing |
| PRO features | Không expose trong v1 (auto-scheduling, critical path, undo, export) |
| Multiple view modes | Chỉ có project view (không có resourceTimeline) |
| License key | Không cần cấu hình — dùng community version |
