import type { GanttStatic } from "dhtmlx-gantt";

import { scaleConfigs } from "./scaleConfigs";
import type { GanttScale } from "../store/types";

const zoomLevelOrder: GanttScale[] = ["hour", "day", "week", "month", "quarter", "year"];

export function initZoomExtension(gantt: GanttStatic): void {
    if (!gantt.ext?.zoom) {
        return;
    }

    gantt.ext.zoom.init({
        levels: zoomLevelOrder.map(name => ({
            name,
            scale_height: 50,
            min_column_width: name === "hour" ? 40 : 60,
            scales: scaleConfigs[name] as never
        })),
        useKey: "ctrlKey",
        trigger: "wheel",
        element: () => gantt.$root?.querySelector(".gantt_task") ?? gantt.$root
    });
}

export function getScaleOrder(): readonly GanttScale[] {
    return zoomLevelOrder;
}

export function getAdjacentScale(current: GanttScale, direction: "in" | "out"): GanttScale {
    const index = zoomLevelOrder.indexOf(current);
    if (index < 0) {
        return current;
    }
    const next = direction === "in" ? index - 1 : index + 1;
    return zoomLevelOrder[Math.min(Math.max(next, 0), zoomLevelOrder.length - 1)];
}
