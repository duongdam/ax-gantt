import type { GanttLink, GanttNormalizedModel, GanttTask } from "../store/types";
import { formatDhtmlxDate } from "../utils/dates";

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

export interface DhtmlxLink {
    id: string;
    source: string | number;
    target: string | number;
    type: string;
}

export interface DhtmlxParsePayload {
    data: DhtmlxTask[];
    links: DhtmlxLink[];
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

    if (task.custom) {
        for (const [key, value] of Object.entries(task.custom)) {
            dhtmlxTask[`cf_${key}`] = value;
        }
    }

    return dhtmlxTask;
}

export function mapLinkToDhtmlx(link: GanttLink): DhtmlxLink {
    return {
        id: String(link.id),
        source: link.source,
        target: link.target,
        type: String(link.type)
    };
}

export function mapModelToDhtmlx(model: GanttNormalizedModel): DhtmlxParsePayload {
    return {
        data: model.tasks.map(mapTaskToDhtmlx),
        links: model.links.map(mapLinkToDhtmlx)
    };
}
