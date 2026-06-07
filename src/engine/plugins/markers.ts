import type { GanttStatic } from "dhtmlx-gantt";

import type { MarkerDef, MarkerPayload } from "../../stores/types";

const TODAY_MARKER_ID = "axgantt-today-marker";
const AXGANTT_MARKER_PREFIX = "axgantt-marker-";
let lastAxGanttMarkerCount = 0;

/** dhtmlx only attaches getMarker/addMarker after the marker plugin is enabled. */
function ensureMarkerPlugin(gantt: GanttStatic): boolean {
    if (typeof gantt.getMarker === "function") {
        return true;
    }

    gantt.plugins({ marker: true });
    return typeof gantt.getMarker === "function";
}

export function clearAxGanttMarkers(gantt: GanttStatic): void {
    if (lastAxGanttMarkerCount === 0) {
        return;
    }

    if (!ensureMarkerPlugin(gantt)) {
        lastAxGanttMarkerCount = 0;
        return;
    }

    for (let index = 0; index < lastAxGanttMarkerCount; index++) {
        const markerId = `${AXGANTT_MARKER_PREFIX}${index}`;
        if (gantt.getMarker(markerId)) {
            gantt.deleteMarker(markerId);
        }
    }
    lastAxGanttMarkerCount = 0;
}

export function applyJsonMarkers(gantt: GanttStatic, payload: MarkerPayload | undefined, enabled: boolean): void {
    if (!enabled || !payload?.markers.length) {
        clearAxGanttMarkers(gantt);
        gantt.config.show_markers = false;
        return;
    }

    if (!ensureMarkerPlugin(gantt)) {
        return;
    }

    clearAxGanttMarkers(gantt);
    gantt.config.show_markers = true;

    payload.markers.forEach((marker: MarkerDef, index: number) => {
        const startDate = new Date(marker.start_date);
        if (Number.isNaN(startDate.getTime())) {
            return;
        }

        gantt.addMarker({
            id: `${AXGANTT_MARKER_PREFIX}${index}`,
            start_date: startDate,
            css: marker.css ?? "axgantt-marker",
            text: marker.text ?? "",
            title: marker.title ?? marker.text ?? ""
        });
    });

    lastAxGanttMarkerCount = payload.markers.length;
}

export function applyTodayMarker(gantt: GanttStatic): void {
    if (!ensureMarkerPlugin(gantt)) {
        return;
    }

    gantt.config.show_markers = true;

    if (gantt.getMarker(TODAY_MARKER_ID)) {
        gantt.deleteMarker(TODAY_MARKER_ID);
    }

    gantt.addMarker({
        id: TODAY_MARKER_ID,
        start_date: new Date(),
        css: "axgantt-today-marker",
        text: "Today",
        title: "Today"
    });
}

export function refreshTodayMarker(gantt: GanttStatic): void {
    if (!ensureMarkerPlugin(gantt)) {
        return;
    }

    if (gantt.getMarker(TODAY_MARKER_ID)) {
        gantt.updateMarker(TODAY_MARKER_ID);
    }
}
