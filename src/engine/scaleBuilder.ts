import type { GanttStatic } from "dhtmlx-gantt";

import type { ScalePayload, WeekLabelFormat } from "../stores/types";
import {
    EXECUTIVE_TIMELINE_ANCHOR_YEAR,
    formatExecutiveWeekLabel,
    getWeekIndexFromDate,
    startOfWeek
} from "./executiveTimeline";

/** ISO week count for anchor year (2026 = 53 weeks). */
export function getWeekCountForYear(year: number): number {
    const anchor = startOfWeek(new Date(year, 0, 1));
    const end = new Date(year, 11, 31);
    let count = 0;
    const cursor = new Date(anchor);
    while (cursor.getTime() <= end.getTime()) {
        count += 1;
        cursor.setDate(cursor.getDate() + 7);
    }
    return count;
}

function formatWeekLabel(date: Date, format: WeekLabelFormat, anchorYear: number): string {
    const index = getWeekIndexFromDate(date, anchorYear);
    if (format === "T##") {
        return formatExecutiveWeekLabel(date, anchorYear);
    }
    return `W${String(index).padStart(2, "0")}`;
}

function formatYearLabel(date: Date): string {
    return String(date.getFullYear());
}

export function applyScalePayload(gantt: GanttStatic, payload: ScalePayload): void {
    const anchorYear = payload.anchorYear ?? EXECUTIVE_TIMELINE_ANCHOR_YEAR;
    const weekFormat = payload.weekLabelFormat ?? "W##";
    const units = payload.scales ?? [
        { unit: "year" as const, step: 1, format: "year" },
        { unit: "week" as const, step: 1, format: weekFormat }
    ];

    gantt.config.scale_height = units.length > 1 ? 56 : 40;
    gantt.config.min_column_width = 48;
    gantt.config.duration_unit = "day";
    gantt.config.time_step = 1440;
    gantt.config.round_dnd_dates = true;

    gantt.config.scales = units.map(unit => {
        const step = unit.step ?? 1;
        if (unit.unit === "year") {
            return {
                unit: "year",
                step,
                format: (date: Date) => formatYearLabel(date)
            };
        }
        if (unit.unit === "week") {
            return {
                unit: "week",
                step,
                format: (date: Date) => formatWeekLabel(date, weekFormat, anchorYear)
            };
        }
        if (unit.unit === "month") {
            return {
                unit: "month",
                step,
                format: gantt.date.date_to_str("%M %Y")
            };
        }
        return {
            unit: "day",
            step,
            format: gantt.date.date_to_str("%d %M")
        };
    }) as typeof gantt.config.scales;
}

export function applyTimelineBounds(gantt: GanttStatic, startDate?: Date, endDate?: Date): void {
    if (startDate) {
        gantt.config.start_date = startDate;
    }
    if (endDate) {
        gantt.config.end_date = endDate;
    }
}
