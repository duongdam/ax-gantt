export type GanttTaskType = "task" | "project" | "milestone";
export type GanttPriority = "low" | "normal" | "high" | "critical";
export type GanttEntityType = "task" | "link" | "resource" | "assignment";

export interface GanttTask {
    id: string;
    text: string;
    start: Date;
    end?: Date;
    duration?: number;
    parentId?: string;
    progress?: number;
    type?: GanttTaskType;
    open?: boolean;
    readonly?: boolean;
    color?: string;
    priority?: GanttPriority;
    siteCode?: string;
    sourceSystem?: string;
    version?: string | number;
    modifiedAt?: Date;
    custom?: Record<string, unknown>;
}

export interface GanttLink {
    id: string;
    source: string;
    target: string;
    type: 0 | 1 | 2 | 3;
    lag?: number;
}

export type GanttResourceType = "human" | "machine" | "room" | "vendor" | "other";

export interface GanttResource {
    id: string;
    name: string;
    type?: GanttResourceType;
    siteCode?: string;
    department?: string;
    capacity?: number;
    calendarId?: string;
    custom?: Record<string, unknown>;
}

export interface GanttAssignment {
    id: string;
    taskId: string;
    resourceId: string;
    value: number;
    start?: Date;
    end?: Date;
}

export interface GanttNormalizedModel {
    tasks: GanttTask[];
    links: GanttLink[];
    resources: GanttResource[];
    assignments: GanttAssignment[];
}

export interface SelectedGanttItem {
    entityType: GanttEntityType;
    id: string;
    label: string;
    raw: Record<string, unknown>;
}

export interface DialogState {
    open: boolean;
    item: SelectedGanttItem | null;
}

export type GanttScale = "hour" | "day" | "week" | "month" | "quarter" | "year";

export interface GanttViewState {
    scale: GanttScale;
    scrollDate?: Date;
    selectedTaskIds: string[];
    selectedResourceIds: string[];
    filters: {
        siteCodes?: string[];
        dateFrom?: Date;
        dateTo?: Date;
        search?: string;
        status?: string[];
    };
}

export type TaskChangeType = "move" | "resize" | "progress" | "text" | "type" | "parent" | "create" | "delete";

export interface EditState {
    isDragging: boolean;
    isResizing: boolean;
    pendingChanges: unknown[];
    undoAvailable: boolean;
    taskSnapshots: Record<string, GanttTask>;
}

export interface UiMessage {
    type: "error" | "warning" | "info";
    code?: string;
    text: string;
}

export const emptyModel = (): GanttNormalizedModel => ({
    tasks: [],
    links: [],
    resources: [],
    assignments: []
});
