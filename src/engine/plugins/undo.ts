import type { GanttStatic } from "dhtmlx-gantt";

import type { FeatureRegistry } from "../FeatureRegistry";

/** PRO stub — activates dhtmlx undo extension when licensed. */
export function applyUndoPlugin(gantt: GanttStatic, features: FeatureRegistry): void {
    if (!features.isProFeatureEnabled("enableUndo")) {
        return;
    }

    gantt.plugins({ undo: true });
}
