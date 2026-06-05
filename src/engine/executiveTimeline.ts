import type { GanttStatic, Task } from "dhtmlx-gantt";

export const EXECUTIVE_TIMELINE_ANCHOR_YEAR = 2026;

export function startOfWeek(date: Date): Date {
    const value = new Date(date);
    const day = value.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    value.setDate(value.getDate() + diff);
    value.setHours(0, 0, 0, 0);
    return value;
}

export function getWeekIndexFromDate(
    date: Date,
    anchorYear: number = EXECUTIVE_TIMELINE_ANCHOR_YEAR
): number {
    const anchor = startOfWeek(new Date(anchorYear, 0, 1));
    const weekStart = startOfWeek(date);
    const diffWeeks = Math.round((weekStart.getTime() - anchor.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, diffWeeks + 1);
}

export function getPhaseLabel(date: Date): string {
    const year = date.getFullYear();
    return date.getMonth() < 6 ? `Phase I · ${year}` : `Phase II · ${year}`;
}

export function formatExecutiveWeekLabel(date: Date, anchorYear?: number): string {
    return `T${getWeekIndexFromDate(date, anchorYear)}`;
}

export function formatExecutivePeriodRange(start: Date, end: Date, anchorYear?: number): string {
    const from = getWeekIndexFromDate(start, anchorYear);
    const to = getWeekIndexFromDate(end, anchorYear);
    return from === to ? `T${from}` : `T${from}–T${to}`;
}

export function applyExecutiveTimelineScales(
    gantt: GanttStatic,
    anchorYear: number = EXECUTIVE_TIMELINE_ANCHOR_YEAR
): void {
    gantt.config.scales = [
        {
            unit: "month",
            step: 6,
            format: (date: Date) => getPhaseLabel(date)
        },
        {
            unit: "week",
            step: 1,
            format: (date: Date) => formatExecutiveWeekLabel(date, anchorYear)
        }
    ] as typeof gantt.config.scales;

    gantt.config.scale_height = 56;
    gantt.config.min_column_width = 48;
    gantt.config.duration_unit = "day";
    gantt.config.time_step = 1440;
    gantt.config.round_dnd_dates = true;
}

export function applyExecutiveGridPresentation(gantt: GanttStatic): void {
    gantt.config.columns = [
        {
            name: "text",
            label: "Portfolio / Product",
            tree: true,
            width: 300,
            min_width: 220,
            resize: true
        },
        {
            name: "period",
            label: "Week",
            align: "center",
            width: 88,
            resize: true,
            template: (task: Task) => String((task as Task & { cf_periodLabel?: string }).cf_periodLabel ?? "")
        },
        {
            name: "progress",
            label: "%",
            align: "center",
            width: 48,
            resize: true,
            template: (task: Task) => {
                if (task.type === "project") {
                    return "";
                }
                return task.progress !== undefined ? `${Math.round(Number(task.progress) * 100)}` : "";
            }
        }
    ];

    gantt.templates.grid_row_class = (_start, _end, task: Task) => {
        const level = (task as Task & { cf_level?: string }).cf_level;
        return level ? `dhl-gantt-row--${level}` : "";
    };

    gantt.templates.task_class = (_start, _end, task: Task) => {
        const level = (task as Task & { cf_level?: string }).cf_level;
        return level ? `dhl-gantt-bar--${level}` : "";
    };

    gantt.templates.task_text = (_start, _end, task: Task) => {
        const level = (task as Task & { cf_level?: string }).cf_level;
        if (level === "company" || level === "program") {
            return "";
        }
        return String(task.text ?? "");
    };
}
