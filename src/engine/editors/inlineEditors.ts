import type { GanttStatic } from "dhtmlx-gantt";

export function applyInlineEditors(gantt: GanttStatic): void {
    gantt.config.columns = gantt.config.columns.map(column => {
        if (column.name === "text") {
            return { ...column, editor: { type: "text", map_to: "text" } };
        }
        if (column.name === "start_date") {
            return { ...column, editor: { type: "date", map_to: "start_date" } };
        }
        if (column.name === "duration") {
            return { ...column, editor: { type: "number", map_to: "duration", min: 0, max: 1000 } };
        }
        return column;
    });
}
