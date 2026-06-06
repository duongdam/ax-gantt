export type GanttTaskType = "task" | "project" | "milestone";
export type GanttPriority = "low" | "normal" | "high" | "critical";
export type GanttEntityType = "task" | "link" | "resource" | "assignment";

export type AxGanttTaskLevel = "portfolio" | "program" | "phase" | "product" | "task";
export type WeekLabelFormat = "W##" | "T##";

/** Raw task shape from taskListJson (dates as ISO strings). */
export interface AxGanttTaskJson {
    id: string;
    text: string;
    start: string;
    end?: string;
    duration?: number;
    parent?: string;
    type?: GanttTaskType;
    open?: boolean;
    progress?: number;
    readonly?: boolean;
    color?: string;
    level?: AxGanttTaskLevel;
    [key: string]: unknown;
}

export interface AxGanttLinkJson {
    id: string;
    source: string;
    target: string;
    type: 0 | 1 | 2 | 3;
    lag?: number;
}

export interface TaskListPayload {
    tasks: AxGanttTaskJson[];
    links?: AxGanttLinkJson[];
}

export interface ScaleUnit {
    unit: "year" | "month" | "week" | "day";
    step?: number;
    format?: string;
}

export interface ScalePayload {
    anchorYear?: number;
    weekLabelFormat?: WeekLabelFormat;
    scales?: ScaleUnit[];
}

export interface ColumnDef {
    name: string;
    label: string;
    width?: number;
    tree?: boolean;
    align?: "left" | "center" | "right";
    resize?: boolean;
    template?: string;
}

export interface ColumnsPayload {
    columns: ColumnDef[];
}

export interface MarkerDef {
    start_date: string;
    css?: string;
    text?: string;
    title?: string;
}

export interface MarkerPayload {
    markers: MarkerDef[];
}

export interface AxGanttParsedModel {
    tasks: GanttTask[];
    links: GanttLink[];
}

export interface JsonParseResult<T> {
    data: T;
    errors: string[];
    warnings: string[];
}

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

export const emptyAxGanttModel = (): AxGanttParsedModel => ({
    tasks: [],
    links: []
});

export const DEFAULT_SCALE_PAYLOAD: ScalePayload = {
    anchorYear: 2026,
    weekLabelFormat: "W##",
    scales: [
        { unit: "year", step: 1, format: "year" },
        { unit: "week", step: 1, format: "W##" }
    ]
};

export const DEFAULT_COLUMNS_PAYLOAD: ColumnsPayload = {
    columns: [{ name: "text", label: "Project", tree: true, width: 300, resize: true }]
};
