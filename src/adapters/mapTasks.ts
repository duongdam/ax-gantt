import type { GanttNormalizedModel, GanttTask } from "../store/types";
import { formatDhtmlxDate } from "../utils/dates";
import { mapAssignments, type DhtmlxAssignment } from "./mapAssignments";
import { mapLinks, type DhtmlxLink } from "./mapLinks";
import { mapResources, type DhtmlxResource } from "./mapResources";

export interface DhtmlxTask {
    id: string;
    text: string;
    start_date: string;
    end_date?: string;
    duration?: number;
    parent?: string | number;
    progress?: number;
    type?: string;
    open?: boolean;
    readonly?: boolean;
    color?: string;
    [key: string]: unknown;
}

export interface DhtmlxParsePayload {
    data: DhtmlxTask[];
    links?: DhtmlxLink[];
    resources?: DhtmlxResource[];
    assignments?: DhtmlxAssignment[];
}

function clampProgress(value: number | undefined): number | undefined {
    if (value === undefined) {
        return undefined;
    }
    return Math.min(1, Math.max(0, value));
}

export function mapTaskToDhtmlx(task: GanttTask): DhtmlxTask {
    const dhtmlxTask: DhtmlxTask = {
        id: String(task.id),
        text: task.text.trim().slice(0, 500),
        start_date: formatDhtmlxDate(task.start),
        parent: task.parentId ?? 0,
        progress: clampProgress(task.progress),
        type: task.type ?? "task",
        open: task.open ?? task.type === "project",
        readonly: task.readonly ?? false
    };

    if (task.end) {
        dhtmlxTask.end_date = formatDhtmlxDate(task.end);
    } else if (task.duration !== undefined) {
        dhtmlxTask.duration = task.duration;
    }

    if (task.color) {
        dhtmlxTask.color = task.color;
    }

    if (task.siteCode) {
        dhtmlxTask.siteCode = task.siteCode;
    }

    if (task.sourceSystem) {
        dhtmlxTask.sourceSystem = task.sourceSystem;
    }

    const status = task.custom?.status;
    if (typeof status === "string") {
        dhtmlxTask.status = status;
    }

    const department = task.custom?.department;
    if (typeof department === "string") {
        dhtmlxTask.department = department;
    }

    if (task.custom) {
        for (const [key, value] of Object.entries(task.custom)) {
            dhtmlxTask[`cf_${key}`] = value;
        }
    }

    if (typeof task.custom?.periodLabel === "string") {
        dhtmlxTask.period = task.custom.periodLabel;
    }

    if (task.version !== undefined) {
        dhtmlxTask.taskVersion = task.version;
    }

    if (task.modifiedAt) {
        dhtmlxTask.taskModifiedAt = formatDhtmlxDate(task.modifiedAt);
    }

    return dhtmlxTask;
}

export function mapTasks(tasks: GanttTask[]): DhtmlxTask[] {
    return tasks.map(mapTaskToDhtmlx);
}

export function mapModelToDhtmlx(model: GanttNormalizedModel): DhtmlxParsePayload {
    const payload: DhtmlxParsePayload = {
        data: mapTasks(model.tasks),
        links: mapLinks(model.links)
    };

    if (model.resources.length > 0) {
        payload.resources = mapResources(model.resources);
    }

    if (model.assignments.length > 0) {
        payload.assignments = mapAssignments(model.assignments, formatDhtmlxDate);
    }

    return payload;
}
