import type { GanttLink, GanttResource, GanttTask, TaskChangeType } from "../store/types";

export interface TaskEventContext {
    taskId: string;
    taskLabel: string;
    siteCode?: string;
    sourceSystem?: string;
    start: string;
    end?: string;
    progress?: number;
    entityType: "task";
}

export interface TaskChangeContext extends TaskEventContext {
    changeType: TaskChangeType;
    previousStart?: string;
    previousEnd?: string;
    previousProgress?: number;
    previousParentId?: string;
}

export interface LinkEventContext {
    linkId: string;
    sourceTaskId: string;
    targetTaskId: string;
    linkType: 0 | 1 | 2 | 3;
    lag?: number;
    entityType: "link";
}

export interface ResourceEventContext {
    resourceId: string;
    resourceName: string;
    siteCode?: string;
    department?: string;
    capacity?: number;
    entityType: "resource";
}

export interface LinkValidationContext {
    sourceTaskId: string;
    targetTaskId: string;
    reason: "circular" | "duplicate" | "readonly";
}

function toIso(date?: Date): string | undefined {
    return date?.toISOString();
}

export function buildTaskEventContext(task: GanttTask): TaskEventContext {
    return {
        taskId: task.id,
        taskLabel: task.text,
        siteCode: task.siteCode,
        sourceSystem: task.sourceSystem,
        start: task.start.toISOString(),
        end: toIso(task.end),
        progress: task.progress,
        entityType: "task"
    };
}

export function buildTaskChangeContext(
    task: GanttTask,
    changeType: TaskChangeType,
    previous?: GanttTask
): TaskChangeContext {
    return {
        ...buildTaskEventContext(task),
        changeType,
        previousStart: toIso(previous?.start),
        previousEnd: toIso(previous?.end),
        previousProgress: previous?.progress,
        previousParentId: previous?.parentId
    };
}

export function buildLinkEventContext(link: GanttLink): LinkEventContext {
    return {
        linkId: link.id,
        sourceTaskId: link.source,
        targetTaskId: link.target,
        linkType: link.type,
        lag: link.lag,
        entityType: "link"
    };
}

export function buildResourceEventContext(resource: GanttResource): ResourceEventContext {
    return {
        resourceId: resource.id,
        resourceName: resource.name,
        siteCode: resource.siteCode,
        department: resource.department,
        capacity: resource.capacity,
        entityType: "resource"
    };
}
