# 3. Configuration

Widget có **17 property groups** trong `src/DhlGanttChart.xml`. Contract đầy đủ: [widget-properties-schema.md](../specs/001-dhl-gantt-chart/contracts/widget-properties-schema.md).

## Group 1: General

| Property | Type | Default | Mô tả |
|----------|------|---------|-------|
| `viewMode` | enum | `project` | `project` \| `resourceTimeline` \| `hybrid` |
| `readOnly` | boolean | `false` | Khóa toàn bộ chỉnh sửa |
| `useMockData` | boolean | `false` | Dùng mock thay Mendix datasource |
| `timeZoneMode` | enum | `browserLocal` | `utc` \| `browserLocal` \| `fixed` |
| `fixedTimeZone` | string | — | IANA timezone khi mode=fixed |
| `dateUnit` | enum | `day` | `minute` \| `hour` \| `day` — đơn vị duration |
| `emptyMessage` | string | "No schedule data" | Text khi không có task |
| `showTrialNotice` | boolean | `true` | Banner trial dhtmlx |

## Group 2: Multiple Dimensions

| Property | Type | Default | Mô tả |
|----------|------|---------|-------|
| `dimensionConfig` | object list | — | Cấu hình từng axis (key, enabled, groupBy, showInGrid, showInFilterBar, label) |
| `primaryGroupDimension` | enum | `none` | Group rows: `none` \| site \| project \| sourceSystem \| department |
| `crossFilterMode` | enum | `and` | `and` \| `or` giữa các dimension |
| `filterMode` | enum | `client` | `client` (slicer trong widget) \| `server` (Mendix refresh) |
| `showDimensionFilterBar` | boolean | `true` | Hiện week/product filter bar |
| `onDimensionFilterChanged` | action | — | Khi filter thay đổi |

**Dimension keys:** `site`, `sourceSystem`, `department`, `status`, `project`, `resource`

## Group 3: Data — Tasks

| Property | Required | Attribute types |
|----------|----------|-----------------|
| `tasksDataSource` | ✅ (nếu không mock) | datasource list |
| `taskId` | ✅ | String, AutoNumber, Integer, Long |
| `taskLabel` | ✅ | String |
| `taskStart` | ✅ | DateTime |
| `taskEnd` | ❌ | DateTime |
| `taskDuration` | ❌ | Integer, Long, Decimal |
| `taskParentId` | ❌ | String, Integer, Long |
| `taskProgress` | ❌ | Decimal, Integer |
| `taskType` | ❌ | String, Enum — `task` \| `project` \| `milestone` |
| `taskOpen` | ❌ | Boolean |
| `taskReadOnly` | ❌ | Boolean — per-task lock |
| `taskColor` | ❌ | String |
| `taskSiteCode` | ❌ | String, Enum |
| `taskSourceSystem` | ❌ | String, Enum |
| `taskStatus` | ❌ | String, Enum |
| `taskVersion` | ❌ | String, Integer, Long — optimistic lock |
| `taskModifiedAt` | ❌ | DateTime |

**Quy tắc:** Cần `taskEnd` **hoặc** `taskDuration`. Nếu map cả hai, duration được ưu tiên (warning W201).

## Group 4: Data — Links

| Property | Mô tả |
|----------|-------|
| `linksDataSource` | List dependency |
| `linkId`, `linkSource`, `linkTarget` | Required khi có links |
| `linkType` | `0`=FS, `1`=SS, `2`=FF, `3`=SF |
| `linkLag` | Lag days/hours |

## Group 5: Data — Resources

| Property | Mô tả |
|----------|-------|
| `resourcesDataSource` | Required cho `resourceTimeline` / `hybrid` |
| `resourceId`, `resourceName` | Required |
| `resourceType` | human, machine, room, vendor, other |
| `resourceSiteCode`, `resourceDepartment` | Dimension keys |
| `resourceCapacity` | Capacity per day — over-allocation highlight |

## Group 6: Data — Assignments

| Property | Mô tả |
|----------|-------|
| `assignmentsDataSource` | Task ↔ Resource mapping |
| `assignmentId`, `assignmentTaskId`, `assignmentResourceId`, `assignmentValue` | Required |
| `assignmentStart`, `assignmentEnd` | Optional date range |

## Group 7: Display & Timeline

| Property | Default | Mô tả |
|----------|---------|-------|
| `initialScale` | `week` | `hour` \| `day` \| `week` \| `month` \| `quarter` \| `year` |
| `initialScrollDate` | — | Expression DateTime — scroll tới ngày |
| `showGrid` / `showChart` | `true` | Hiện grid / timeline |
| `rowHeight` | `36` | px |
| `barHeight` | `24` | px |
| `fitOnLoad` | `true` | Fit tasks on load |
| `highlightWeekends` | `true` | CSS class weekend |
| `workingTimeEnabled` | `false` | Working hours |
| `showTodayMarker` | `true` | Vertical today line |
| `enableTooltips` | `true` | Hover tooltips |
| `enableQuickInfo` | `false` | dhtmlx quick info popup |
| `enableSplitTasks` | `false` | Split task bars |
| `enableBaselines` | `false` | **PRO** — baseline bars |
| `showDeadlines` | `false` | Deadline markers |
| `taskBarTemplate` | `default` | `default` \| `compact` |
| `showToolbar` | `true` | GanttToolbar (hiện ẩn trong executive view) |

### Executive vs standard scale

| `initialScale` | Timeline | Grid columns |
|----------------|----------|--------------|
| `week` | Phase I/II + T-weeks | Portfolio / Product, Week, % |
| Khác | scaleConfigs chuẩn | Task, Start, Days, Site |

## Group 8: Task Editing

| Property | Default |
|----------|---------|
| `enableDragMove` | `true` |
| `enableResize` | `true` |
| `enableProgressDrag` | `true` |
| `snapToGrid` | `true` |
| `enableCreateTask` | `false` |
| `enableDeleteTask` | `false` |
| `enableHierarchyEdit` | `true` |
| `enableLightbox` | `true` |
| `enableInlineEdit` | `false` |
| `enableCopyPaste` | `false` |
| `enableContextMenu` | `true` |

**Permission model:** `readOnly=true` → khóa tất cả. Ngược lại, `taskReadOnly` trên từng task quyết định task đó có edit được không.

## Group 9: Links

| Property | Default |
|----------|---------|
| `enableLinkDraw` | `true` |
| `enableLinkDelete` | `true` |

## Group 10: Selection & Keyboard

| Property | Default |
|----------|---------|
| `enableMultiselect` | `false` |
| `enableKeyboard` | `true` |
| `selectedTaskId` | Writable attribute — two-way selection |
| `selectedResourceId` | Writable attribute |

## Group 11–13: PRO Features

| Group | Properties |
|-------|------------|
| Scheduling | `autoScheduling`, `enableConstraints`, `showCriticalPath` |
| Resources | `showResourceHistogram` |
| Export & Undo | `enableUndo`, `enableExport` |

Cần `licenseKey` hợp lệ. Trial: feature silent hoặc watermark.

## Group 14: Detail Dialog

| Property | Default |
|----------|---------|
| `enableDetailDialog` | `true` |
| `detailDialogTitle` | — |
| `detailDialogShowCustom` | `true` — hiện `custom` fields |

## Group 15: Events

Xem [07-events-and-actions.md](./07-events-and-actions.md).

## Group 16: Dimension Filters (Expressions)

Bind từ page context — áp dụng filter programmatically:

| Expression | Return type |
|------------|-------------|
| `filterSiteCodes` | String (comma-separated) |
| `filterSourceSystems` | String |
| `filterDepartments` | String |
| `filterStatuses` | String |
| `filterDateFrom` / `filterDateTo` | DateTime |
| `filterSearch` | String |

## Group 17: Advanced

| Property | Default | Mô tả |
|----------|---------|-------|
| `licenseKey` | — | dhtmlx commercial license |
| `advancedConfigJson` | — | Override dhtmlx config (JSON) |
| `debugMode` | `false` | Console logging |
| `refreshInterval` | `0` | Auto-refresh seconds; 0=off |

## Development helpers

| Property | Default | Mô tả |
|----------|---------|-------|
| `mockShouldFail` | `false` | Simulate load error |
| `mockScenario` | `default` | `default` \| `empty` \| `performance` |

## Cấu hình khuyến nghị

### Executive portfolio demo

```
useMockData = true
initialScale = week
primaryGroupDimension = none
showDimensionFilterBar = true
enableDetailDialog = true
readOnly = false
```

### Production Mendix

```
useMockData = false
tasksDataSource = [Task entity list]
taskId, taskLabel, taskStart = mapped
filterMode = client
onTaskChanged = [Commit microflow]
onBeforeTaskChange = [Validation microflow]
taskVersion = mapped (conflict detection)
```

### Resource timeline

```
viewMode = resourceTimeline
resourcesDataSource + assignmentsDataSource = configured
enableDragMove = true (reassign via drag)
```

## Studio validation (editorConfig)

| Code | Severity | Điều kiện |
|------|----------|-----------|
| S001 | error | `useMockData=false` nhưng không có tasksDataSource |
| S002 | error | `resourceTimeline` without resourcesDataSource |
| S003 | error | `advancedConfigJson` invalid JSON |
| S004 | error | Missing taskId or taskStart mapping |
