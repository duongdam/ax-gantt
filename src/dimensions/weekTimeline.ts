import { getWeekIndexFromDate, startOfWeek } from "../engine/executiveTimeline";
import type { GanttNormalizedModel, GanttTask } from "../store/types";

export interface WeekBucket {
    id: string;
    index: number;
    label: string;
    rangeLabel: string;
    start: Date;
    end: Date;
}

export interface ProjectSegment {
    id: string;
    label: string;
    start: Date;
    end: Date;
    progress?: number;
}

function endOfWeek(weekStart: Date): Date {
    const value = new Date(weekStart);
    value.setDate(value.getDate() + 6);
    value.setHours(23, 59, 59, 999);
    return value;
}

function taskOverlapsRange(task: GanttTask, from: Date, to: Date): boolean {
    const taskStart = task.start.getTime();
    const taskEnd = (task.end ?? task.start).getTime();
    return taskEnd >= from.getTime() && taskStart <= to.getTime();
}

function formatShortDate(date: Date): string {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatWeekRange(start: Date, end: Date): string {
    return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function getWeekBuckets(model: GanttNormalizedModel): WeekBucket[] {
    if (model.tasks.length === 0) {
        return [];
    }

    const starts = model.tasks.map(task => task.start.getTime());
    const ends = model.tasks.map(task => (task.end ?? task.start).getTime());
    const min = Math.min(...starts);
    const max = Math.max(...ends);

    const weeks: WeekBucket[] = [];
    const anchorYear = new Date(min).getFullYear();
    let cursor = startOfWeek(new Date(min));

    while (cursor.getTime() <= max) {
        const end = endOfWeek(cursor);
        const hasTasks = model.tasks.some(task => taskOverlapsRange(task, cursor, end));

        if (hasTasks) {
            const index = getWeekIndexFromDate(cursor, anchorYear);
            weeks.push({
                id: `T${index}`,
                index,
                label: `T${index}`,
                rangeLabel: formatWeekRange(cursor, end),
                start: new Date(cursor),
                end: new Date(end)
            });
        }

        cursor = new Date(end);
        cursor.setDate(cursor.getDate() + 1);
        cursor.setHours(0, 0, 0, 0);
    }

    return weeks;
}

export function findWeekByTimeRange(weeks: WeekBucket[], from?: Date, to?: Date): WeekBucket | undefined {
    if (!from || !to) {
        return undefined;
    }

    return weeks.find(week => isSameDay(week.start, from) && isSameDay(week.end, to));
}

export function getProjectSegmentsForWeek(model: GanttNormalizedModel, week: WeekBucket): ProjectSegment[] {
    const segments: ProjectSegment[] = [];

    for (const task of model.tasks) {
        const level = task.custom?.level;
        if (level !== "product" && task.type !== "milestone") {
            continue;
        }
        if (!taskOverlapsRange(task, week.start, week.end)) {
            continue;
        }

        segments.push({
            id: task.id,
            label: task.text,
            start: task.start,
            end: task.end ?? task.start,
            progress: task.progress
        });
    }

    return segments.sort((left, right) => left.start.getTime() - right.start.getTime());
}
