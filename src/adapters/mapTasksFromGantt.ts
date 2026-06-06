import type { Task } from "dhtmlx-gantt";

import type { GanttTask } from "../store/types";
import { formatDhtmlxDate } from "../utils/dates";

function parseGanttDate(value: Date | string | undefined): Date | undefined {
    if (!value) {
        return undefined;
    }
    return value instanceof Date ? value : new Date(value);
}

export function ganttTaskToModel(task: Task, existing?: GanttTask): GanttTask {
    const start = parseGanttDate(task.start_date as Date | string) ?? existing?.start ?? new Date();
    const end = parseGanttDate(task.end_date as Date | string);

    return {
        id: String(task.id),
        text: String(task.text ?? existing?.text ?? ""),
        start,
        end,
        duration: task.duration ?? existing?.duration,
        parentId: task.parent && String(task.parent) !== "0" ? String(task.parent) : existing?.parentId,
        progress: typeof task.progress === "number" ? task.progress : existing?.progress,
        type: (task.type as GanttTask["type"]) ?? existing?.type ?? "task",
        open: task.open ?? existing?.open,
        readonly: task.readonly ?? existing?.readonly,
        color: (task.color as string | undefined) ?? existing?.color,
        siteCode: (task.siteCode as string | undefined) ?? existing?.siteCode,
        sourceSystem: (task.sourceSystem as string | undefined) ?? existing?.sourceSystem,
        priority: existing?.priority,
        version: existing?.version,
        modifiedAt: existing?.modifiedAt,
        custom: existing?.custom
    };
}

export function modelTaskToGanttPatch(task: GanttTask): Task {
    const patch: Record<string, unknown> = {
        id: task.id,
        text: task.text,
        start_date: formatDhtmlxDate(task.start),
        progress: task.progress,
        readonly: task.readonly ?? false
    };

    if (task.end) {
        patch.end_date = formatDhtmlxDate(task.end);
    } else if (task.duration !== undefined) {
        patch.duration = task.duration;
    }

    if (task.parentId) {
        patch.parent = task.parentId;
    }

    return patch as unknown as Task;
}
