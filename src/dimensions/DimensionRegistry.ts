import type { DimensionDefinition, DimensionKey } from "./dimensionTypes";
import type { GanttAssignment, GanttNormalizedModel, GanttResource, GanttTask } from "../store/types";

export interface DimensionValueContext {
    assignments: GanttAssignment[];
    resources: GanttResource[];
    tasks: GanttTask[];
}

export interface DimensionAxis extends DimensionDefinition {
    relationProperty?: string;
}

function uniqueSorted(values: Array<string | undefined>): string[] {
    return [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
}

function getStatus(task: GanttTask): string | undefined {
    const status = task.custom?.status;
    return typeof status === "string" ? status : undefined;
}

function getDepartment(task: GanttTask, context: DimensionValueContext): string | undefined {
    const fromCustom = task.custom?.department;
    if (typeof fromCustom === "string") {
        return fromCustom;
    }

    const resourceIds = context.assignments
        .filter(assignment => assignment.taskId === task.id)
        .map(assignment => assignment.resourceId);

    for (const resourceId of resourceIds) {
        const resource = context.resources.find(item => item.id === resourceId);
        if (resource?.department) {
            return resource.department;
        }
    }

    return undefined;
}

function getResourceNames(task: GanttTask, context: DimensionValueContext): string[] {
    return context.assignments
        .filter(assignment => assignment.taskId === task.id)
        .map(assignment => context.resources.find(resource => resource.id === assignment.resourceId)?.name)
        .filter((value): value is string => Boolean(value));
}

export function getRootProjectId(task: GanttTask, tasks: GanttTask[]): string {
    let current: GanttTask | undefined = task;
    const byId = new Map(tasks.map(item => [item.id, item]));

    while (current?.parentId) {
        const parent = byId.get(current.parentId);
        if (!parent) {
            break;
        }
        current = parent;
    }

    return current?.id ?? task.id;
}

export const BUILTIN_DIMENSIONS: DimensionAxis[] = [
    { key: "time", enabled: true, groupBy: false, showInGrid: false, showInFilterBar: false, label: "Time" },
    {
        key: "site",
        enabled: true,
        groupBy: true,
        showInGrid: true,
        showInFilterBar: false,
        label: "Site",
        relationProperty: "siteCode"
    },
    { key: "project", enabled: true, groupBy: true, showInGrid: false, showInFilterBar: false, label: "Project" },
    { key: "resource", enabled: true, groupBy: true, showInGrid: false, showInFilterBar: false, label: "Resource" },
    {
        key: "sourceSystem",
        enabled: true,
        groupBy: true,
        showInGrid: true,
        showInFilterBar: false,
        label: "Source",
        relationProperty: "sourceSystem"
    },
    {
        key: "department",
        enabled: true,
        groupBy: true,
        showInGrid: false,
        showInFilterBar: false,
        label: "Department",
        relationProperty: "department"
    },
    {
        key: "status",
        enabled: true,
        groupBy: false,
        showInGrid: false,
        showInFilterBar: false,
        label: "Status",
        relationProperty: "status"
    }
];

export const defaultDimensionDefinitions: DimensionDefinition[] = BUILTIN_DIMENSIONS.map(
    ({ relationProperty: _relationProperty, ...definition }) => definition
);

export function getDimensionAxis(key: DimensionKey): DimensionAxis | undefined {
    return BUILTIN_DIMENSIONS.find(dimension => dimension.key === key);
}

export function getRelationProperty(key: DimensionKey): string | undefined {
    return getDimensionAxis(key)?.relationProperty;
}

export function getDimensionValuesForTask(
    task: GanttTask,
    key: DimensionKey,
    context: DimensionValueContext
): string[] {
    switch (key) {
        case "site":
            return task.siteCode ? [task.siteCode] : [];
        case "sourceSystem":
            return task.sourceSystem ? [task.sourceSystem] : [];
        case "status":
            return getStatus(task) ? [getStatus(task)!] : [];
        case "department": {
            const department = getDepartment(task, context);
            return department ? [department] : [];
        }
        case "resource":
            return getResourceNames(task, context);
        case "project":
            return [getRootProjectId(task, context.tasks)];
        default:
            return [];
    }
}

export function getAvailableValuesForDimension(model: GanttNormalizedModel, key: DimensionKey): string[] {
    const context: DimensionValueContext = {
        assignments: model.assignments,
        resources: model.resources,
        tasks: model.tasks
    };

    switch (key) {
        case "site":
            return uniqueSorted(model.tasks.map(task => task.siteCode));
        case "sourceSystem":
            return uniqueSorted(model.tasks.map(task => task.sourceSystem));
        case "status":
            return uniqueSorted(model.tasks.map(getStatus));
        case "department":
            return uniqueSorted([
                ...model.resources.map(resource => resource.department),
                ...model.tasks.map(task => getDepartment(task, context))
            ]);
        case "resource":
            return uniqueSorted(model.resources.map(resource => resource.name));
        case "project":
            return uniqueSorted(model.tasks.map(task => getRootProjectId(task, model.tasks)));
        default:
            return [];
    }
}

export function getRootProjectLabel(taskId: string, tasks: GanttTask[]): string {
    const task = tasks.find(item => item.id === taskId);
    return task?.text ?? taskId;
}

export function enrichTaskDimensions(model: GanttNormalizedModel): GanttNormalizedModel {
    const context: DimensionValueContext = {
        assignments: model.assignments,
        resources: model.resources,
        tasks: model.tasks
    };

    return {
        ...model,
        tasks: model.tasks.map(task => {
            const department = getDepartment(task, context);
            if (!department) {
                return task;
            }

            return {
                ...task,
                custom: {
                    ...(task.custom ?? {}),
                    department
                }
            };
        })
    };
}
