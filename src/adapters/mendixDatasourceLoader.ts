import { ValueStatus } from "mendix";
import type { ListAttributeValue, ObjectItem } from "mendix";
import type { Big } from "big.js";

import { parseLinkType } from "./mapLinks";
import { parseResourceType } from "./mapResources";
import {
    readBooleanAttribute,
    readDateAttribute,
    readNumberAttribute,
    readProgressAttribute,
    readStringAttribute
} from "./mendixAttributeUtils";
import type { MendixDatasourceProps, MendixLoadResult, MendixParseIssue } from "./mendixDatasourceTypes";
import type { GanttAssignment, GanttLink, GanttNormalizedModel, GanttResource, GanttTask, GanttTaskType } from "../store/types";
import { emptyModel } from "../store/types";

const TASK_TYPES: GanttTaskType[] = ["task", "project", "milestone"];

function parseTaskType(value: string | undefined): GanttTaskType {
    if (!value) {
        return "task";
    }
    const normalized = value.toLowerCase() as GanttTaskType;
    return TASK_TYPES.includes(normalized) ? normalized : "task";
}

function mapTaskItem(item: ObjectItem, index: number, props: MendixDatasourceProps, issues: MendixParseIssue[]): GanttTask | null {
    const id = readStringAttribute(props.taskId, item);
    const text = readStringAttribute(props.taskLabel, item);
    const start = readDateAttribute(props.taskStart, item);

    if (!id) {
        issues.push({ code: "W101", message: `Task at index ${index} missing taskId`, entityId: item.id });
        return null;
    }

    if (!text) {
        issues.push({ code: "W101", message: `Task ${id} missing label`, entityId: id });
        return null;
    }

    if (!start) {
        issues.push({ code: "W101", message: `Task ${id} missing start date`, entityId: id });
        return null;
    }

    const end = readDateAttribute(props.taskEnd, item);
    const duration = readNumberAttribute(props.taskDuration, item);
    const type = parseTaskType(readStringAttribute(props.taskType, item));
    const status = readStringAttribute(props.taskStatus, item);

    if (end && end.getTime() < start.getTime()) {
        issues.push({ code: "E005", message: `Invalid date range for task ${id}`, entityId: id });
        return null;
    }

    if (!end && duration === undefined) {
        issues.push({ code: "W101", message: `Task ${id} missing end and duration`, entityId: id });
        return null;
    }

    const task: GanttTask = {
        id,
        text,
        start,
        end,
        duration,
        parentId: readStringAttribute(props.taskParentId, item),
        progress: readProgressAttribute(props.taskProgress, item),
        type,
        open: readBooleanAttribute(props.taskOpen, item),
        readonly: readBooleanAttribute(props.taskReadOnly, item),
        color: readStringAttribute(props.taskColor, item),
        siteCode: readStringAttribute(props.taskSiteCode, item),
        sourceSystem: readStringAttribute(props.taskSourceSystem, item),
        version:
            readStringAttribute(props.taskVersion, item) ??
            (readNumberAttribute(props.taskVersion as ListAttributeValue<Big>, item) as string | number | undefined),
        modifiedAt: readDateAttribute(props.taskModifiedAt, item)
    };

    if (status) {
        task.custom = { ...(task.custom ?? {}), status };
    }

    return task;
}

function mapLinkItem(
    item: ObjectItem,
    index: number,
    props: MendixDatasourceProps,
    taskIds: Set<string>,
    issues: MendixParseIssue[]
): GanttLink | null {
    const id = readStringAttribute(props.linkId, item);
    const source = readStringAttribute(props.linkSource, item);
    const target = readStringAttribute(props.linkTarget, item);

    if (!id || !source || !target) {
        issues.push({ code: "E002", message: `Link at index ${index} missing required fields`, entityId: id ?? item.id });
        return null;
    }

    if (!taskIds.has(source) || !taskIds.has(target)) {
        issues.push({ code: "E002", message: `Link ${id} references missing task`, entityId: id });
        return null;
    }

    return {
        id,
        source,
        target,
        type: parseLinkType(
            readStringAttribute(props.linkType, item) ??
                readNumberAttribute(props.linkType as ListAttributeValue<Big>, item)
        ),
        lag: readNumberAttribute(props.linkLag, item) ?? 0
    };
}

function mapResourceItem(item: ObjectItem, index: number, props: MendixDatasourceProps, issues: MendixParseIssue[]): GanttResource | null {
    const id = readStringAttribute(props.resourceId, item);
    const name = readStringAttribute(props.resourceName, item);

    if (!id || !name) {
        issues.push({ code: "E003", message: `Resource at index ${index} missing id or name`, entityId: id ?? item.id });
        return null;
    }

    return {
        id,
        name,
        type: parseResourceType(readStringAttribute(props.resourceType, item)),
        siteCode: readStringAttribute(props.resourceSiteCode, item),
        department: readStringAttribute(props.resourceDepartment, item),
        capacity: readNumberAttribute(props.resourceCapacity, item)
    };
}

function mapAssignmentItem(
    item: ObjectItem,
    index: number,
    props: MendixDatasourceProps,
    taskIds: Set<string>,
    resourceIds: Set<string>,
    issues: MendixParseIssue[]
): GanttAssignment | null {
    const id = readStringAttribute(props.assignmentId, item);
    const taskId = readStringAttribute(props.assignmentTaskId, item);
    const resourceId = readStringAttribute(props.assignmentResourceId, item);
    const value = readNumberAttribute(props.assignmentValue, item);

    if (!id || !taskId || !resourceId || value === undefined) {
        issues.push({
            code: "E003",
            message: `Assignment at index ${index} missing required fields`,
            entityId: id ?? item.id
        });
        return null;
    }

    if (!taskIds.has(taskId) || !resourceIds.has(resourceId)) {
        issues.push({ code: "E003", message: `Assignment ${id} references missing task/resource`, entityId: id });
        return null;
    }

    return {
        id,
        taskId,
        resourceId,
        value,
        start: readDateAttribute(props.assignmentStart, item),
        end: readDateAttribute(props.assignmentEnd, item)
    };
}

function dedupeById<T extends { id: string }>(items: T[], issues: MendixParseIssue[], entityLabel: string): T[] {
    const seen = new Set<string>();
    const result: T[] = [];

    for (const item of items) {
        if (seen.has(item.id)) {
            issues.push({ code: "E001", message: `Duplicate ${entityLabel} ID: ${item.id}`, entityId: item.id });
            continue;
        }
        seen.add(item.id);
        result.push(item);
    }

    return result;
}

function mapListItems<T>(
    items: ObjectItem[] | undefined,
    mapper: (item: ObjectItem, index: number) => T | null
): T[] {
    if (!items?.length) {
        return [];
    }

    return items.map(mapper).filter((item): item is T => item !== null);
}

export function loadGanttModelFromMendix(props: MendixDatasourceProps): MendixLoadResult {
    const issues: MendixParseIssue[] = [];
    const tasksSource = props.tasksDataSource;

    if (!tasksSource) {
        return {
            model: emptyModel(),
            issues: [{ code: "L002", message: "Tasks datasource is not configured" }],
            isLoading: false,
            error: "Tasks datasource is not configured"
        };
    }

    if (tasksSource.status === ValueStatus.Loading) {
        return { model: emptyModel(), issues, isLoading: true, error: null };
    }

    if (tasksSource.status !== ValueStatus.Available) {
        return {
            model: emptyModel(),
            issues: [{ code: "L002", message: "Mendix tasks datasource unavailable" }],
            isLoading: false,
            error: "Mendix tasks datasource unavailable"
        };
    }

    const tasks = dedupeById(
        mapListItems(tasksSource.items, (item, index) => mapTaskItem(item, index, props, issues)),
        issues,
        "task"
    );
    const taskIds = new Set(tasks.map(task => task.id));

    let links: GanttLink[] = [];
    const linksSource = props.linksDataSource;
    if (linksSource?.status === ValueStatus.Available && linksSource.items?.length) {
        links = dedupeById(
            mapListItems(linksSource.items, (item, index) => mapLinkItem(item, index, props, taskIds, issues)),
            issues,
            "link"
        );
    }

    let resources: GanttResource[] = [];
    const resourcesSource = props.resourcesDataSource;
    if (resourcesSource?.status === ValueStatus.Available && resourcesSource.items?.length) {
        resources = dedupeById(
            mapListItems(resourcesSource.items, (item, index) => mapResourceItem(item, index, props, issues)),
            issues,
            "resource"
        );
    }
    const resourceIds = new Set(resources.map(resource => resource.id));

    let assignments: GanttAssignment[] = [];
    const assignmentsSource = props.assignmentsDataSource;
    if (assignmentsSource?.status === ValueStatus.Available && assignmentsSource.items?.length) {
        assignments = dedupeById(
            mapListItems(assignmentsSource.items, (item, index) =>
                mapAssignmentItem(item, index, props, taskIds, resourceIds, issues)
            ),
            issues,
            "assignment"
        );
    }

    const model: GanttNormalizedModel = { tasks, links, resources, assignments };

    return {
        model,
        issues,
        isLoading: false,
        error: null
    };
}
