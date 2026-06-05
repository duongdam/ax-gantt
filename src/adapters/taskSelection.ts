import type { GanttTask } from "../store/types";
import type { SelectedGanttItem } from "../store/types";

export function taskToRawFields(task: GanttTask): Record<string, unknown> {
    const raw: Record<string, unknown> = {
        id: task.id,
        text: task.text,
        start: task.start.toISOString(),
        end: task.end?.toISOString(),
        duration: task.duration,
        parentId: task.parentId,
        progress: task.progress,
        type: task.type,
        siteCode: task.siteCode,
        sourceSystem: task.sourceSystem,
        priority: task.priority,
        version: task.version,
        modifiedAt: task.modifiedAt?.toISOString(),
        readonly: task.readonly,
        color: task.color
    };

    if (task.custom) {
        for (const [key, value] of Object.entries(task.custom)) {
            raw[key] = value;
        }
    }

    return raw;
}

export function buildTaskSelectedItem(task: GanttTask): SelectedGanttItem {
    return {
        entityType: "task",
        id: task.id,
        label: task.text,
        raw: taskToRawFields(task)
    };
}
