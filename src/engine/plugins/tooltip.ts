import type { GanttStatic } from "dhtmlx-gantt";

export function applyTooltipPlugin(gantt: GanttStatic): void {
    gantt.plugins({ tooltip: true });

    gantt.templates.tooltip_text = (start, end, task) => {
        const lines = [`<b>${task.text}</b>`];
        if (task.siteCode) {
            lines.push(`Site: ${task.siteCode}`);
        }
        if (task.sourceSystem) {
            lines.push(`Source: ${task.sourceSystem}`);
        }
        lines.push(`Start: ${gantt.templates.tooltip_date_format(start)}`);
        if (end) {
            lines.push(`End: ${gantt.templates.tooltip_date_format(end)}`);
        }
        if (typeof task.progress === "number") {
            lines.push(`Progress: ${Math.round(task.progress * 100)}%`);
        }
        return lines.join("<br/>");
    };
}
