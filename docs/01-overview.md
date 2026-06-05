# 1. Overview

## Giới thiệu

**Dhl Gantt Chart** là Mendix pluggable widget bọc thư viện [dhtmlx Gantt 9](https://dhtmlx.com/docs/products/dhtmlxGantt/) để hiển thị và tương tác với lịch dự án đa site, đa nguồn dữ liệu. Widget được thiết kế cho bối cảnh **Samsung DS P/M Partner** — lập kế hoạch sản xuất, portfolio executive, và quản lý nguồn lực.

### Use cases chính

| Use case | Mô tả |
|----------|-------|
| **Executive portfolio** | Tổng quan 10 công ty → chương trình → sản phẩm trên timeline tuần (T1–T52) |
| **Multi-site schedule** | Tasks từ nhiều site (HS-01, VN-02, KR-03…) trên một biểu đồ |
| **Resource planning** | Gán resource, phát hiện over-allocation trên resource timeline |
| **Interactive editing** | Kéo/thả, resize, vẽ dependency, commit qua Mendix microflow |

## Tech stack

| Thành phần | Phiên bản / Ghi chú |
|------------|---------------------|
| Mendix | Studio Pro 10.24+ |
| React | 19 |
| TypeScript | Strict |
| State | MobX 6 + mobx-react-lite |
| Chart | dhtmlx-gantt 9.1.4 |
| Build | @mendix/pluggable-widgets-tools 11 |

## Tính năng theo nhóm

### Hiển thị & timeline

- Grid + chart đồng bộ, WBS tree mở rộng/thu gọn
- **Executive mode** (`initialScale=week`): scale trên **Phase I/II · năm**, scale dưới **T1…Tn**
- Cột grid executive: Portfolio / Product, Week, Progress %
- Today marker, highlight weekend, tooltips
- View mode: `project` | `resourceTimeline` | `hybrid`

### Lọc & dimensions

- **DimensionFilterBar**: tab tuần + segment sản phẩm (mock/demo mode)
- Dimension slicer client-side: site, sourceSystem, department, status, project, time
- Cross-filter AND/OR, debounce 300ms
- Expression filters từ Mendix page context

### Dữ liệu

- **Mock mode**: portfolio 10 công ty, links, resources, assignments
- **Mendix mode**: 4 datasource (tasks, links, resources, assignments) + attribute mapping
- Canonical model độc lập với Mendix entity và dhtmlx internals

### Tương tác

- Click **task bar** (timeline) → Detail dialog
- Drag move, resize, progress drag (có thể tắt từng loại)
- Vẽ/xóa link dependency (FS/SS/FF/SF)
- Optimistic edit + rollback khi microflow fail hoặc version conflict
- 15+ Mendix action hooks

### PRO features (cần license key)

Auto-scheduling, critical path, baselines, undo/redo, export, resource histogram — implemented behind license gate; trial hiển thị watermark.

## Demo nhanh (mock)

1. Thêm widget **Dhl Gantt Chart** vào page
2. **Use mock data** = `true`
3. **Initial scale** = `week`
4. **Primary group dimension** = `none`
5. **Show dimension filter bar** = `true`
6. Run locally

Kết quả: portfolio executive với week tabs, product segments, và hierarchical grid.

## Giới hạn hiện tại (v1)

| Mục | Trạng thái |
|-----|------------|
| `dimensionConfig` XML | Định nghĩa trong XML; chưa wire đầy đủ từ props → DimensionStore |
| GanttToolbar | Ẩn trong executive view (commented trong GanttContainer) |
| PRO features | Stub + license gate; cần license thương mại để bật đầy đủ |
| Performance scenario | Tách biệt — 500 task generic, không dùng executive portfolio |
