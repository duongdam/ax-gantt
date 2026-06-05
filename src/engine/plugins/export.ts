import type { GanttStatic } from "dhtmlx-gantt";

import type { FeatureRegistry } from "../FeatureRegistry";

/** PRO stub — activates dhtmlx export extension when licensed. */
export function applyExportPlugin(gantt: GanttStatic, features: FeatureRegistry): void {
    if (!features.isProFeatureEnabled("enableExport")) {
        return;
    }

    gantt.plugins({ export_api: true });
}
