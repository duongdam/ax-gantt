import type { GanttTask } from "../stores/types";

export type AxGanttChangeType = "move" | "resize" | "progress" | "create" | "rowDrag";

export interface TaskEventContext {
    taskId: string;
    taskLabel: string;
    start: string;
    end?: string;
    progress?: number;
    parentId?: string;
    level?: string;
}

export interface TaskChangeContext extends TaskEventContext {
    changeType: AxGanttChangeType;
    previousStart?: string;
    previousEnd?: string;
    previousProgress?: number;
    previousParentId?: string;
    cancelled?: boolean;
}

function toIso(date?: Date): string | undefined {
    return date?.toISOString();
}

function readLevel(task: GanttTask): string | undefined {
    const level = task.custom?.level;
    return typeof level === "string" ? level : undefined;
}

export function buildTaskEventContext(task: GanttTask): TaskEventContext {
    return {
        taskId: task.id,
        taskLabel: task.text,
        start: task.start.toISOString(),
        end: toIso(task.end),
        progress: task.progress,
        parentId: task.parentId,
        level: readLevel(task)
    };
}

export function buildTaskChangeContext(
    task: GanttTask,
    changeType: AxGanttChangeType,
    previous?: GanttTask,
    cancelled = false
): TaskChangeContext {
    return {
        ...buildTaskEventContext(task),
        changeType,
        previousStart: toIso(previous?.start),
        previousEnd: toIso(previous?.end),
        previousProgress: previous?.progress,
        previousParentId: previous?.parentId,
        cancelled
    };
}
