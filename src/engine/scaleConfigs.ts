import type { GanttScale } from "../store/types";

export const scaleConfigs: Record<GanttScale, { unit: string; step: number; format: string }[]> = {
    hour: [
        { unit: "day", step: 1, format: "%d %M" },
        { unit: "hour", step: 1, format: "%H:%i" }
    ],
    day: [
        { unit: "month", step: 1, format: "%F %Y" },
        { unit: "day", step: 1, format: "%d" }
    ],
    week: [
        { unit: "month", step: 1, format: "%F %Y" },
        { unit: "week", step: 1, format: "W%W" }
    ],
    month: [
        { unit: "year", step: 1, format: "%Y" },
        { unit: "month", step: 1, format: "%M" }
    ],
    quarter: [
        { unit: "year", step: 1, format: "%Y" },
        { unit: "month", step: 3, format: "%M" }
    ],
    year: [{ unit: "year", step: 1, format: "%Y" }]
};
