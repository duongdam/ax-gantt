import type { CrossFilterMode, DimensionFilter, DimensionTimeRange } from "./dimensionTypes";
import { getDimensionValuesForTask, type DimensionValueContext } from "./DimensionRegistry";
import type { GanttLink, GanttNormalizedModel, GanttTask } from "../store/types";

export interface DimensionSlicerOptions {
    filters: DimensionFilter[];
    crossFilterMode: CrossFilterMode;
    timeRange?: DimensionTimeRange;
}

function taskOverlapsRange(task: GanttTask, timeRange?: DimensionTimeRange): boolean {
    if (!timeRange?.from && !timeRange?.to) {
        return true;
    }

    const taskStart = task.start.getTime();
    const taskEnd = (task.end ?? task.start).getTime();
    const from = timeRange.from?.getTime();
    const to = timeRange.to?.getTime();

    if (from !== undefined && taskEnd < from) {
        return false;
    }
    if (to !== undefined && taskStart > to) {
        return false;
    }
    return true;
}

function matchesFilter(
    task: GanttTask,
    filter: DimensionFilter,
    context: DimensionValueContext
): boolean {
    if (filter.values.length === 0 || filter.key === "time") {
        return true;
    }

    const taskValues = getDimensionValuesForTask(task, filter.key, context);
    if (taskValues.length === 0) {
        return filter.mode === "exclude";
    }

    const hasMatch = taskValues.some(value => filter.values.includes(value));
    return filter.mode === "exclude" ? !hasMatch : hasMatch;
}

function matchesDimensionFilters(
    task: GanttTask,
    filters: DimensionFilter[],
    crossFilterMode: CrossFilterMode,
    context: DimensionValueContext
): boolean {
    const activeFilters = filters.filter(filter => filter.key !== "time" && filter.values.length > 0);
    if (activeFilters.length === 0) {
        return true;
    }

    if (crossFilterMode === "or") {
        return activeFilters.some(filter => matchesFilter(task, filter, context));
    }

    return activeFilters.every(filter => matchesFilter(task, filter, context));
}

function includeAncestors(tasks: GanttTask[], matchedIds: Set<string>): GanttTask[] {
    const byId = new Map(tasks.map(task => [task.id, task]));
    const resultIds = new Set(matchedIds);

    for (const id of matchedIds) {
        let current = byId.get(id);
        while (current?.parentId) {
            resultIds.add(current.parentId);
            current = byId.get(current.parentId);
        }
    }

    return tasks.filter(task => resultIds.has(task.id));
}

function filterLinks(links: GanttLink[], taskIds: Set<string>): GanttLink[] {
    return links.filter(link => taskIds.has(link.source) && taskIds.has(link.target));
}

export function dimensionSlicer(
    model: GanttNormalizedModel,
    options: DimensionSlicerOptions
): GanttNormalizedModel {
    const context: DimensionValueContext = {
        assignments: model.assignments,
        resources: model.resources,
        tasks: model.tasks
    };

    const matchedTasks = model.tasks.filter(task => {
        if (!taskOverlapsRange(task, options.timeRange)) {
            return false;
        }
        return matchesDimensionFilters(task, options.filters, options.crossFilterMode, context);
    });

    const matchedIds = new Set(matchedTasks.map(task => task.id));
    const tasksWithAncestors = includeAncestors(model.tasks, matchedIds);
    const finalTaskIds = new Set(tasksWithAncestors.map(task => task.id));

    return {
        tasks: tasksWithAncestors,
        links: filterLinks(model.links, finalTaskIds),
        resources: model.resources,
        assignments: model.assignments.filter(
            assignment => finalTaskIds.has(assignment.taskId)
        )
    };
}

export function countMatchingTasks(
    model: GanttNormalizedModel,
    options: DimensionSlicerOptions
): number {
    return dimensionSlicer(model, options).tasks.filter(task => task.type !== "project").length;
}
