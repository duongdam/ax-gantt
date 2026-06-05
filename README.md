# DHL Gantt Chart

Mendix pluggable widget wrapping **dhtmlx Gantt 9** for executive portfolio and multi-site project schedules. Supports Mendix datasource mapping, week-based dimensional filtering, resource planning views, and full task interaction.

**Full documentation:** [docs/README.md](./docs/README.md)

## Tech stack

| Layer | Technology |
|-------|------------|
| Platform | Mendix Studio Pro 10.24+ |
| UI | React 19, TypeScript |
| State | MobX, mobx-react-lite |
| Chart | dhtmlx-gantt 9.1.4 |
| Build | `@mendix/pluggable-widgets-tools` |

## Features

### Executive portfolio view (default mock)

- **Hierarchical grid** — Company → Program → Product with expandable WBS tree
- **Dual timeline scales** — top: **Phase I / Phase II · year**; bottom: **T1–T52** week buckets
- **Week filter bar** — select a week tab, then filter by product segments active in that week
- **English mock portfolio** — 10 company trees (CO-A … CO-J) with programs, products, links, resources, and assignments
- **Detail dialog** — opens on **task bar click** (timeline), not grid row click

### Core Gantt capabilities

- **Project Gantt** — tasks, milestones, links, hierarchy, drag/resize, dependency drawing
- **Resource planning** — `viewMode`: `project`, `resourceTimeline`, or `hybrid`
- **Multi-dimensional filtering** — client-side slicer for time, site, source system, department, status (configurable via widget properties)
- **Mendix datasources** — tasks, links, resources, assignments with attribute mapping
- **Optimistic concurrency** — `taskVersion` / `taskModifiedAt` mapping with rollback on conflict
- **PRO-ready** — license-gated stubs for undo, export, auto-scheduling, critical path

## Prerequisites

- Node.js >= 16
- pnpm
- Mendix Studio Pro 10.24+

## Setup

```bash
pnpm install
pnpm run dev    # watch build → dist/
pnpm run build  # production .mpk
```

Configure Mendix project path in `package.json`:

```json
"config": {
  "projectPath": "/path/to/your/mendix/project"
}
```

Import `dist/1.0.0/mendix.DhlGanttChart.mpk` into Studio Pro (or use dev sync).

## Quick test (mock data)

1. Add **Dhl Gantt Chart** widget to a page
2. Set **Use mock data** = `true`
3. Set **Initial scale** = `week` (recommended for executive timeline)
4. Run locally — expect the executive portfolio with week tabs and product segments

Recommended widget settings for the demo:

| Property | Value |
|----------|-------|
| Use mock data | `true` |
| Initial scale | `week` |
| Primary group dimension | `none` |
| Show dimension filter bar | `true` |
| Date unit | `day` |

### Mock scenarios

| Scenario | Purpose |
|----------|---------|
| `default` | Executive portfolio — 10 companies, ~42 tasks, links, resources, assignments |
| `empty` | Empty state |
| `performance` | 500 generated tasks (load/stress baseline) |

### Mock portfolio hierarchy

```
Company A
  ├─ Samsung Mobile Device Development → Z Fold, S26+
  └─ Honda Automotive Development → CRV, Civic Hybrid
Company B → EV Battery & Energy → Cell Module Gen-3, BMS
Company C — Display → OLED panel line
… (10 companies: CO-A … CO-J)
```

Mock task definitions live in `src/mock/datasources/tasks.mock.ts`.

## Architecture (mock mode)

```
DimensionFilterBar (week T1… + product segments)
  → DimensionStore (timeRange + segmentRootId)
  → dimensionSlicer → GanttEngine.parse()
  → dhtmlx Gantt (Phase I/II + T-week timeline, hierarchical grid)
```

## Mendix datasource mode

1. Set **Use mock data** = `false`
2. Configure **Tasks datasource** + required mappings: `taskId`, `taskLabel`, `taskStart`
3. Optional: links, resources, assignments datasources
4. For resource views set **View mode** = `resourceTimeline` or `hybrid`

When `initialScale` is `week`, the widget applies executive timeline scales and grid columns automatically.

## Project structure

```
src/
├── DhlGanttChart.tsx          # Widget entry, store wiring
├── components/                # GanttContainer, DimensionFilterBar, DetailDialog, …
├── engine/                    # GanttEngine, executiveTimeline, configBuilder, eventBridge
├── dimensions/                # DimensionStore helpers, weekTimeline slicer
├── adapters/                  # Mendix datasource mappers and loaders
├── mock/datasources/          # Mock tasks, links, resources, assignments
├── store/                     # MobX stores (Gantt, Datasource, Dimension)
└── ui/                        # Widget CSS
```

## Development

```bash
pnpm run lint
pnpm run test:unit
```

## Widget property groups

See `specs/001-dhl-gantt-chart/contracts/widget-properties-schema.md` for the full property schema.

## Documentation

| Guide | Description |
|-------|-------------|
| [Overview](./docs/01-overview.md) | Features, use cases, tech stack |
| [Architecture](./docs/02-architecture.md) | Data flow, stores, engine |
| [Configuration](./docs/03-configuration.md) | All 17 widget property groups |
| [Mock Data](./docs/04-mock-data.md) | Executive portfolio mock |
| [Mendix Integration](./docs/05-mendix-integration.md) | Datasource, persistence |
| [Filtering & Timeline](./docs/06-filtering-and-timeline.md) | Week filter, executive timeline |
| [Events & Actions](./docs/07-events-and-actions.md) | Microflow hooks, edit flow |
| [Development](./docs/08-development.md) | Build, test, extend |
| [Troubleshooting](./docs/09-troubleshooting.md) | Common issues, error codes |

## Specification (Spec Kit)

- Spec: `specs/001-dhl-gantt-chart/spec.md`
- Plan: `specs/001-dhl-gantt-chart/plan.md`
- Tasks: `specs/001-dhl-gantt-chart/tasks.md`
- Quickstart: `specs/001-dhl-gantt-chart/quickstart.md`

## License

Widget code: Apache-2.0. dhtmlx Gantt requires a [commercial license](https://dhtmlx.com/docs/products/dhtmlxGantt/) for production (trial shows watermark).
