import type { GanttStatic } from "dhtmlx-gantt";

export function applyLightboxConfig(gantt: GanttStatic): void {
    gantt.config.lightbox.sections = [
        { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
        { name: "time", type: "duration", map_to: "auto" },
        { name: "type", type: "typeselect", map_to: "type" }
    ];

    gantt.locale.labels.section_description = "Task name";
    gantt.locale.labels.section_time = "Time period";
    gantt.locale.labels.section_type = "Type";
}
