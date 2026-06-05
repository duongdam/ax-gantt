import type { GanttStatic } from "dhtmlx-gantt";

export type ViewMode = "project" | "resourceTimeline" | "hybrid";

export function applyViewLayout(gantt: GanttStatic, viewMode: ViewMode): void {
    if (viewMode === "resourceTimeline") {
        gantt.config.layout = {
            css: "gantt_container",
            rows: [
                {
                    cols: [
                        { view: "resourceGrid", scrollX: "scrollHor", scrollY: "scrollVer", width: 220 },
                        { resizer: true, width: 1 },
                        { view: "resourceTimeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                        { view: "scrollbar", id: "scrollVer" }
                    ]
                },
                { view: "scrollbar", id: "scrollHor", height: 20 }
            ]
        };
        return;
    }

    if (viewMode === "hybrid") {
        gantt.config.layout = {
            css: "gantt_container",
            rows: [
                {
                    cols: [
                        { view: "grid", scrollX: "scrollHor", scrollY: "scrollVer" },
                        { resizer: true, width: 1 },
                        { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                        { view: "scrollbar", id: "scrollVer" }
                    ]
                },
                { resizer: true, height: 1 },
                {
                    height: 220,
                    cols: [
                        { view: "resourceGrid", scrollX: "scrollHor", scrollY: "resourceVer", width: 220 },
                        { resizer: true, width: 1 },
                        { view: "resourceTimeline", scrollX: "scrollHor", scrollY: "resourceVer" },
                        { view: "scrollbar", id: "resourceVer" }
                    ]
                },
                { view: "scrollbar", id: "scrollHor", height: 20 }
            ]
        };
        return;
    }

    gantt.config.layout = {
        css: "gantt_container",
        rows: [
            {
                cols: [
                    { view: "grid", scrollX: "scrollHor", scrollY: "scrollVer" },
                    { resizer: true, width: 1 },
                    { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
                    { view: "scrollbar", id: "scrollVer" }
                ]
            },
            { view: "scrollbar", id: "scrollHor", height: 20 }
        ]
    };
}

export function usesResourcePanel(viewMode: ViewMode): boolean {
    return viewMode === "resourceTimeline" || viewMode === "hybrid";
}
