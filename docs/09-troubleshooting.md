# 9. Troubleshooting

## Lỗi render & runtime

### "Could not render widget"

**Nguyên nhân phổ biến:**
- `gantt.init()` gọi khi container chưa mount hoặc đang loading
- Grouping plugin lỗi với empty model
- dhtmlx CSS chưa load

**Fix:**
- Đảm bảo `useMockData=true` hoặc datasource configured
- Check `WidgetErrorBoundary` message trong browser console
- Verify `useGanttLifecycle` waits for `!isLoading`
- Rebuild widget: `pnpm run build`

### Blank chart / no tasks

| Check | Action |
|-------|--------|
| Mock mode | `useMockData=true`, `mockScenario=default` |
| Mendix mode | tasksDataSource populated, taskId/taskStart mapped |
| Filters | Clear dimension filters; check `filterDateFrom/To` expressions |
| Segment filter | Click **All** in product segments |
| Empty scenario | `mockScenario=empty` intentionally empty |

### Detail dialog không mở

- Click phải vào **task bar** trên timeline, không phải grid row
- `enableDetailDialog=true`
- Task type project/company có bar — click vào vùng bar nếu visible

## Edit issues

### Drag/resize không hoạt động

```
readOnly = false
enableDragMove = true  (move)
enableResize = true    (resize)
taskReadOnly = false   (per task)
```

### Edit bị rollback

| Message | Cause | Fix |
|---------|-------|-----|
| "Changes could not be saved" | `onTaskChanged` returned false | Fix microflow; return true on success |
| "Task was modified by another user" | Version mismatch | Refresh data; increment version in microflow |
| Microflow exception | Unhandled error in MF | Check Mendix console |

### Link không tạo được

| Issue | Fix |
|-------|-----|
| Circular dependency | E002 — remove would-be cycle |
| Self-link | Blocked automatically |
| `enableLinkDraw=false` | Enable in properties |
| Readonly task | Check taskReadOnly |

## Filter issues

### Week tabs không hiện

- Model phải có tasks với valid dates
- `showDimensionFilterBar=true`
- `getWeekBuckets()` returns empty nếu không có task

### Product segments trống

- Chỉ products (`custom.level=product`) và milestones hiện trong segment list
- Product phải overlap với active week date range

### Filter quá aggressive — no tasks visible

- Click **All** trong product segments
- `dimension.clearAllFilters()` (programmatic)
- Check `crossFilterMode=and` với nhiều filters active
- Verify expression filters (`filterSiteCodes`, etc.)

## Performance

### Slow với nhiều tasks

- Dùng `mockScenario=performance` để benchmark
- `filterMode=server` + Mendix XPath pre-filter
- `smart_rendering=true` (enabled by default)
- Giảm `refreshInterval` hoặc set 0

### Memory leak on navigation

- Verify `engine.destroy()` called on unmount
- Check `eventBridge.detach()` in lifecycle cleanup

## Mendix Studio

### S001: tasksDataSource required

`useMockData=false` but no datasource configured → add datasource or enable mock.

### S002: resourcesDataSource required

`viewMode=resourceTimeline` without resources → configure resources datasource.

### S004: taskId/taskStart required

Map required attributes on tasks datasource.

### Widget không update sau code change

```bash
pnpm run build
# Re-import .mpk or restart dev sync
# Hard refresh browser (Ctrl+Shift+R)
```

## dhtmlx license

### Trial watermark

- Expected without `licenseKey`
- Set `showTrialNotice=true` to inform users
- Purchase license: https://dhtmlx.com/docs/products/dhtmlxGantt/

### PRO features không hoạt động

| Feature | Requirement |
|---------|-------------|
| autoScheduling | licenseKey + `autoScheduling=true` |
| criticalPath | licenseKey + `showCriticalPath=true` |
| undo | licenseKey + `enableUndo=true` |
| export | licenseKey + `enableExport=true` |
| baselines | licenseKey + `enableBaselines=true` |

Trial: features silently disabled or limited.

## Error codes reference

Chi tiết: [error-codes.md](../specs/001-dhl-gantt-chart/contracts/error-codes.md)

### Parse errors (E001–E005)

| Code | Message | Recovery |
|------|---------|----------|
| E001 | Duplicate task ID | Skip duplicate |
| E002 | Link missing task / circular | Skip link / show toast |
| E003 | Assignment missing ref | Skip assignment |
| E004 | Circular parent | Flatten to root |
| E005 | End before start | Skip task |

### Parse warnings (W101–W104)

| Code | Message | Recovery |
|------|---------|----------|
| W101 | Missing end and duration | Skip task |
| W102 | Trial license active | Show notice |
| W103 | Progress out of range | Clamp 0..1 |
| W104 | Unknown task type | Default to `task` |

### Load errors (L001–L003)

| Code | UI |
|------|-----|
| L001 | Mock load failed — Retry button |
| L002 | Mendix datasource unavailable |
| L003 | Timeout |

Test mock error: `mockShouldFail=true`

## Debug checklist

Enable `debugMode=true`:

1. Open browser DevTools → Console
2. Check parse issues logged
3. Inspect MobX state via React DevTools
4. Verify network (Mendix datasource refresh)
5. Check `datasource.model.tasks.length` after load
6. Check `dimension.sliceVersion` increments on filter

## Getting help

1. Check [docs/](../docs/) for feature-specific guides
2. Review [spec.md](../specs/001-dhl-gantt-chart/spec.md) acceptance criteria
3. Run `pnpm run test:unit` to verify local setup
4. Inspect `WidgetErrorBoundary` fallback UI for stack traces
