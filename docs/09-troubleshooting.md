# 9. Troubleshooting

## Lỗi render & runtime

### "Could not render widget"

**Nguyên nhân phổ biến:**
- `gantt.init()` gọi khi container chưa mount hoặc đang loading
- `taskListJson` parse error dẫn đến model rỗng
- dhtmlx CSS chưa load

**Fix:**
- Dùng `useMockData=true` để test trước
- Check browser console → `WidgetErrorBoundary` log stack trace
- Verify `useGanttLifecycle` đợi `!isLoading`
- Rebuild widget: `pnpm run build`

---

### Blank chart / no tasks

| Check | Action |
|-------|--------|
| Mock mode | `useMockData=true`, F5 refresh |
| Mendix mode | Kiểm tra `taskListJson` expression có trả về string không rỗng |
| JSON parse error | Mở browser console → tìm E001–E005 warnings |
| Tasks thiếu `start` | Validate date format `YYYY-MM-DD` |
| Parent/child sai thứ tự | Đảm bảo parent trước child trong JSON array |

---

### Chart hiện nhưng không có data Mendix

1. Kiểm tra microflow `MF_BuildTaskListJson` trả về JSON hợp lệ
2. Log output microflow → copy vào JSON validator
3. Verify `taskListJson` expression binding trong Studio Pro
4. Check `ganttStartDate`/`ganttEndDate` không lọc mất tất cả tasks

---

### PM Header không hiển thị

- Kiểm tra các expression `roadmapNo`, `roadmapRevision` đã bind chưa
- Nếu tất cả props null → header ẩn (component không render khi không có data)

---

## Edit issues

### Drag/resize không hoạt động

```
readOnly   = false
mayEdit    = true  (hoặc không set, default true)
dragMove   = true  (move)
dragResize = true  (resize)
```

Check `effectiveReadOnly = readOnly || !mayEdit`. Nếu `mayEdit` bind expression trả về `false` → toàn bộ edit bị khóa.

---

### Edit bị rollback

| Toast message | Nguyên nhân | Fix |
|---------------|-------------|-----|
| "Changes could not be saved" | Microflow throw exception | Fix lỗi trong MF; check Mendix log |
| "Task was modified by another user" | Version/ModifiedAt conflict | Refresh page; increment version trong MF |
| Rollback ngay lập tức, không gọi MF | `action.canExecute = false` | Check MF security/page context |

---

### onTaskMove / onTaskResize không được gọi

- Action phải được wire trong Studio Pro
- Widget check `action?.canExecute` trước `execute()` — nếu false thì bỏ qua
- Đảm bảo microflow accessible từ current user role

---

## JSON parse errors

### Validation errors (E-codes)

| Code | Nguyên nhân | Fix |
|------|-------------|-----|
| `E001` | `tasks` array null/không phải JSON/rỗng | Kiểm tra microflow return valid JSON |
| `E002` | `id` bị trùng trong tasks | Ensure TaskKey unique |
| `E003` | `parent` trỏ đến id không tồn tại | Check thứ tự tasks, parent phải xuất hiện trước |
| `E004` | Hierarchy depth > 5 | Widget vẫn render nhưng có warning |
| `E005` | `start` không parse được | Dùng format `YYYY-MM-DD` |

### Validation warnings (W-codes)

| Code | Nguyên nhân | Behavior |
|------|-------------|---------|
| `W101` | Task không có `end` lẫn `duration` | Default 1 ngày, show warning |

### Kiểm tra parse errors

Bật browser DevTools → Console → tìm log từ `parseTaskListJson`:

```
[AxGantt] Parse error E003: parent "PH-1" not found for task "PROD-1"
[AxGantt] Parse warning W101: task "TSK-5" missing end and duration
```

---

## Scale / timeline issues

### Timeline không hiển thị đúng tuần

- Kiểm tra `scaleJson` hợp lệ
- Nếu để trống `{}` → dùng default 2026 W01–W53
- `anchorYear` trong scaleJson phải match dữ liệu task

### 2026 chỉ hiện đến W52

- 2026 có **53 tuần** theo ISO 8601
- Widget tự tính, nhưng nếu `ganttEndDate` set `[%EndOfCurrentYear%]` (Dec 31) có thể bị cut-off một phần W53
- Fix: `ganttEndDate = addDays([%EndOfCurrentYear%], 7)`

### Markers không hiển thị

- `enableMarker = true` (required)
- `markerJson` phải bind và trả về JSON hợp lệ
- Date format trong marker: `"YYYY-MM-DD"` (không có time)

---

## Performance

### Slow với nhiều tasks (>500)

- Giảm số columns trong `columnsJson`
- Không dùng quá nhiều custom fields
- Tắt `autoFit` và `fitTasks`
- Giảm `ganttHeight` nếu không cần scroll nhiều

### Memory leak khi navigate

- Verify `engine.destroy()` called on component unmount
- Check `eventBridge.detach()` trong lifecycle cleanup hook

---

## antd / Theme issues

### antd components không theo Mendix theme

- Đảm bảo `ConfigProvider` bao ngoài toàn bộ widget (kiểm tra `AxGantt.tsx`)
- `useAtlasTheme()` đọc CSS vars từ `:root` — cần Atlas UI CSS load trước widget render
- Nếu chạy dev server ngoài Mendix: fallback colors được dùng (#D40511, 4px, 14px)

### Atlas UI CSS variables không đọc được

```typescript
// Debug: check trong browser console
getComputedStyle(document.documentElement)
  .getPropertyValue("--color-brand-primary")
// Expected: "#D40511" hoặc tương tự
// Empty string: Atlas UI chưa load hoặc variable tên sai
```

---

## Mendix Studio

### S001: taskListJson chưa bind

`useMockData=false` nhưng `taskListJson` expression trống → thêm expression binding hoặc bật `useMockData=true`.

### Widget không update sau code change

```bash
pnpm run build
# Re-import .mpk hoặc restart dev sync
# Hard refresh browser: Ctrl+Shift+R (hoặc Cmd+Shift+R)
```

### typings/AxGanttProps.d.ts không cập nhật

Rebuild sau khi thay đổi `AxGantt.xml`:

```bash
pnpm run build
# hoặc
pnpm run dev  # watch mode tự generate
```

---

## Error codes reference

### Parse errors (E001–E005)

| Code | Message | Recovery |
|------|---------|----------|
| E001 | taskListJson is null/empty/invalid JSON | Widget hiện EmptyState |
| E002 | Duplicate task ID | Skip duplicate, warn |
| E003 | Parent ID not found | Skip task, warn |
| E004 | Hierarchy depth > 5 | Render với warning |
| E005 | Start date cannot be parsed | Skip task, warn |

### Parse warnings (W101)

| Code | Message | Recovery |
|------|---------|----------|
| W101 | Task missing `end` and `duration` | Default 1 ngày |

---

## Debug checklist

1. Mở browser DevTools → Console
2. Check `[AxGantt]` log entries
3. Kiểm tra `JsonDataStore.model.tasks.length` via React DevTools / MobX DevTools
4. Kiểm tra JSON expression trong microflow bằng cách log string result
5. Test JSON trong validator (VD: [jsonlint.com](https://jsonlint.com))
6. Test với `useMockData=true` để loại trừ vấn đề JSON

## Getting help

1. Check [docs/](../docs/) cho feature-specific guide
2. Review [axgantt-implementation-guide.md](./axgantt-implementation-guide.md) cho full walkthrough
3. Chạy `pnpm run test:unit` để verify local setup
4. Inspect `WidgetErrorBoundary` fallback UI cho stack traces
