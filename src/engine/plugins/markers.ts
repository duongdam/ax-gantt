import type { GanttStatic } from "dhtmlx-gantt";

import type { MarkerDef, MarkerPayload } from "../../stores/types";

const TODAY_MARKER_ID = "dhl-today-marker";
const AXGANTT_MARKER_PREFIX = "axgantt-marker-";
let lastAxGanttMarkerCount = 0;

export function clearAxGanttMarkers(gantt: GanttStatic): void {
    for (let index = 0; index < lastAxGanttMarkerCount; index++) {
        const markerId = `${AXGANTT_MARKER_PREFIX}${index}`;
        if (gantt.getMarker(markerId)) {
            gantt.deleteMarker(markerId);
        }
    }
    lastAxGanttMarkerCount = 0;
}

export function applyJsonMarkers(gantt: GanttStatic, payload: MarkerPayload | undefined, enabled: boolean): void {
    clearAxGanttMarkers(gantt);

    if (!enabled || !payload?.markers.length) {
        gantt.config.show_markers = false;
        return;
    }

    gantt.plugins({ marker: true });
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
