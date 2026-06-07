import type {
    AxGanttLinkJson,
    AxGanttParsedModel,
    AxGanttTaskJson,
    GanttLink,
    GanttTask,
    JsonParseResult,
    TaskListPayload
} from "../stores/types";

const MAX_HIERARCHY_DEPTH = 5;

function parseDate(value: unknown): Date | null {
    if (typeof value !== "string" || !value.trim()) {
        return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date;
}

function mapLink(raw: AxGanttLinkJson): GanttLink {
    return {
        id: String(raw.id),
        source: String(raw.source),
        target: String(raw.target),
        type: raw.type,
        lag: raw.lag
    };
}

function mapTask(raw: AxGanttTaskJson, warnings: string[]): GanttTask | null {
    const start = parseDate(raw.start);
    if (!start) {
        warnings.push(`E005: Task "${raw.id}" has unparseable start date — skipped`);
        return null;
    }

    let end = raw.end ? parseDate(raw.end) : undefined;
    if (raw.end && !end) {
        warnings.push(`E005: Task "${raw.id}" has unparseable end date`);
    }

    if (!end && raw.duration !== undefined && raw.duration > 0) {
        end = new Date(start);
        end.setDate(end.getDate() + raw.duration);
    }

    if (!end) {
        warnings.push(`W101: Task "${raw.id}" missing end/duration — defaulting to 1 day`);
        end = new Date(start);
        end.setDate(end.getDate() + 1);
    }

    const custom: Record<string, unknown> = {};
    if (raw.level) {
        custom.level = raw.level;
    }
    for (const [key, value] of Object.entries(raw)) {
        if (
            ![
                "id",
                "text",
                "start",
                "end",
                "duration",
                "parent",
                "type",
                "open",
                "progress",
                "readonly",
                "color",
                "level"
            ].includes(key)
        ) {
            custom[key] = value;
        }
    }

    return {
        id: String(raw.id),
        text: String(raw.text ?? "").trim() || String(raw.id),
        start,
        end,
        duration: raw.duration,
        parentId: raw.parent ? String(raw.parent) : undefined,
        progress: raw.progress,
        type: raw.type ?? "task",
        open: raw.open ?? raw.type === "project",
        readonly: raw.readonly,
        color: raw.color,
        custom: Object.keys(custom).length > 0 ? custom : undefined
    };
}

function getHierarchyDepth(taskId: string, parentMap: Map<string, string | undefined>): number {
    let depth = 1;
    let current = parentMap.get(taskId);
    const visited = new Set<string>();

    while (current) {
        if (visited.has(current)) {
            break;
        }
        visited.add(current);
        depth += 1;
        current = parentMap.get(current);
    }

    return depth;
}

export function parseTaskListJson(input: string | null | undefined): JsonParseResult<AxGanttParsedModel> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!input?.trim()) {
        errors.push("E001: taskListJson is empty");
        return { data: { tasks: [], links: [] }, errors, warnings };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(input);
    } catch {
        errors.push("E001: taskListJson is not valid JSON");
        return { data: { tasks: [], links: [] }, errors, warnings };
    }

    const payload = parsed as TaskListPayload;
    if (!payload.tasks || !Array.isArray(payload.tasks)) {
        errors.push("E001: taskListJson.tasks array is required");
        return { data: { tasks: [], links: [] }, errors, warnings };
    }

    if (payload.tasks.length === 0) {
        errors.push("E001: taskListJson.tasks must not be empty");
        return { data: { tasks: [], links: [] }, errors, warnings };
    }

    const seenIds = new Set<string>();
    const parentMap = new Map<string, string | undefined>();

    for (const raw of payload.tasks) {
        const id = String(raw.id ?? "");
        if (!id) {
            warnings.push("Skipped task with missing id");
            continue;
        }
        if (seenIds.has(id)) {
            errors.push(`E002: Duplicate task id "${id}"`);
            continue;
        }
        seenIds.add(id);
        parentMap.set(id, raw.parent ? String(raw.parent) : undefined);
    }

    if (errors.some(e => e.startsWith("E002"))) {
        return { data: { tasks: [], links: [] }, errors, warnings };
    }

    for (const [id, parentId] of parentMap) {
        if (parentId && !seenIds.has(parentId)) {
            errors.push(`E003: Task "${id}" references unknown parent "${parentId}"`);
        }
    }

    if (errors.some(e => e.startsWith("E003"))) {
        return { data: { tasks: [], links: [] }, errors, warnings };
    }

    for (const [id] of parentMap) {
        const depth = getHierarchyDepth(id, parentMap);
        if (depth > MAX_HIERARCHY_DEPTH) {
            warnings.push(`E004: Task "${id}" exceeds max hierarchy depth (${MAX_HIERARCHY_DEPTH})`);
        }
    }

    const tasks: GanttTask[] = [];
    for (const raw of payload.tasks) {
        const task = mapTask(raw, warnings);
        if (task) {
            tasks.push(task);
        }
    }

    const links: GanttLink[] = (payload.links ?? []).map(mapLink);

    return { data: { tasks, links }, errors, warnings };
}
