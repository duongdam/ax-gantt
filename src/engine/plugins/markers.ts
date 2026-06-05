import type { GanttStatic } from "dhtmlx-gantt";

const TODAY_MARKER_ID = "dhl-today-marker";

export function applyTodayMarker(gantt: GanttStatic): void {
    gantt.plugins({ marker: true });
    gantt.config.show_markers = true;

    const existing = gantt.getMarker(TODAY_MARKER_ID);
    if (existing) {
        gantt.deleteMarker(TODAY_MARKER_ID);
    }

    gantt.addMarker({
        id: TODAY_MARKER_ID,
        start_date: new Date(),
        css: "dhl-gantt-today-marker",
        text: "Today",
        title: "Today"
    });
}

export function refreshTodayMarker(gantt: GanttStatic): void {
    if (!gantt.getMarker(TODAY_MARKER_ID)) {
        applyTodayMarker(gantt);
        return;
    }
    gantt.updateMarker(TODAY_MARKER_ID);
}
