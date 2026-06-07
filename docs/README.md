# DHL Gantt Chart — Documentation

Tài liệu chi tiết cho Mendix pluggable widget **Dhl Gantt Chart** (dhtmlx Gantt 9).

> **Đi làm / không có AI:** bắt đầu tại **[15 — Kế hoạch implement tại công ty](./15-ke-hoach-implement-cong-ty.md)** → clone repo cá nhân → làm theo P0–P4.

## Mục lục

| # | Tài liệu | Nội dung |
|---|----------|----------|
| 1 | [Overview](./01-overview.md) | Giới thiệu, use case, tech stack, tính năng |
| 2 | [Architecture](./02-architecture.md) | Kiến trúc, data flow, stores, engine |
| 3 | [Configuration](./03-configuration.md) | Toàn bộ widget properties (17 nhóm) |
| 4 | [Mock Data](./04-mock-data.md) | Executive portfolio mock, scenarios, cấu trúc dữ liệu |
| 5 | [Mendix Integration](./05-mendix-integration.md) | Datasource mapping, domain model, persistence |
| 6 | [Filtering & Timeline](./06-filtering-and-timeline.md) | Week filter, dimensions, executive timeline |
| 7 | [Events & Actions](./07-events-and-actions.md) | Mendix actions, context objects, edit flow |
| 8 | [Development](./08-development.md) | Setup, build, test, mở rộng widget |
| 9 | [Troubleshooting](./09-troubleshooting.md) | Lỗi thường gặp, error codes |
| 10 | [Oracle Scale Domain](./10-oracle-scale-domain.md) | DB Oracle + Mendix cho scaleJson |
| 11 | [Microflow & Elasticsearch](./11-microflow-nanoflow-elasticsearch.md) | MF/NF catalog, ES analytics dashboard |
| 12 | [JSON Reference](./12-json-reference.md) | **Toàn bộ field JSON — chức năng & nhiệm vụ** |
| 13 | [Oracle — Hướng dẫn DBA](./13-oracle-huong-dan-dba.md) | **Quan hệ bảng, cài đặt, query — cho DBA mới** |
| 14 | [Mendix — Ghép nhanh](./14-mendix-tich-hop-nhanh.md) | **Domain, microflow, ES — playbook 1–2 ngày** |
| 15 | [**Kế hoạch implement tại công ty**](./15-ke-hoach-implement-cong-ty.md) | **Offline playbook P0–P4 — START HERE** |

## Tài liệu kỹ thuật (Spec Kit)

Các contract và spec gốc nằm trong `specs/001-dhl-gantt-chart/`:

- [spec.md](../specs/001-dhl-gantt-chart/spec.md) — Feature specification
- [plan.md](../specs/001-dhl-gantt-chart/plan.md) — Implementation plan
- [data-model.md](../specs/001-dhl-gantt-chart/data-model.md) — Canonical data model
- [contracts/](../specs/001-dhl-gantt-chart/contracts/) — Widget schema, error codes, action context

## Quick links

```bash
pnpm install && pnpm run dev    # Watch build
pnpm run build                  # Production .mpk
pnpm run test:unit              # Unit tests
```

Widget package: `dist/1.0.0/mendix.AxGantt.mpk`
