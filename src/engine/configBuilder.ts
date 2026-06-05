import type { GanttStatic } from "dhtmlx-gantt";

import type { GanttResource } from "../store/types";
import type { GanttScale } from "../store/types";
import { getDefaultDhtmlxDateFormat } from "../utils/dates";
import { applyInlineEditors } from "./editors/inlineEditors";
import { applyLightboxConfig } from "./editors/lightboxConfig";
import type { FeatureRegistry } from "./FeatureRegistry";
import { applyTodayMarker } from "./plugins/markers";
import { applyTooltipPlugin } from "./plugins/tooltip";
import { applyExecutiveGridPresentation, applyExecutiveTimelineScales } from "./executiveTimeline";
import { scaleConfigs } from "./scaleConfigs";
import { applyViewLayout, type ViewMode, usesResourcePanel } from "./viewLayouts";
import { initZoomExtension } from "./zoomConfig";

const scaleConfigsRef = scaleConfigs;

export interface ApplyGanttConfigOptions {
    scale?: GanttScale;
    viewMode?: ViewMode;
    licenseKey?: string;
    rowHeight?: number;
    barHeight?: number;
}

export function applyGanttConfig(
    gantt: GanttStatic,
    features: FeatureRegistry,
    options: ApplyGanttConfigOptions = {}
): void {
    const flags = features.getFlags();
    const scale = options.scale ?? "week";
    const viewMode = options.viewMode ?? "project";

    if (options.licenseKey?.trim()) {
        gantt.license = options.licenseKey.trim();
    }

    gantt.config.date_format = getDefaultDhtmlxDateFormat();
    gantt.config.xml_date = getDefaultDhtmlxDateFormat();
    gantt.config.smart_rendering = true;
    gantt.config.open_tree_initially = true;
    gantt.config.order_branch = true;
    gantt.config.order_branch_free = true;
    gantt.config.auto_types = true;
    gantt.config.show_grid = flags.showGrid;
    gantt.config.show_chart = flags.showChart;
    gantt.config.readonly = flags.readOnly;
    gantt.config.drag_move = flags.enableDragMove;
    gantt.config.drag_resize = flags.enableResize;
    gantt.config.drag_progress = flags.enableProgressDrag;
    gantt.config.drag_links = flags.enableLinkDraw;
    gantt.config.multiselect = flags.enableMultiselect;
    gantt.config.keyboard_navigation = flags.enableKeyboard;
    gantt.config.fit_tasks = true;
    gantt.config.row_height = options.rowHeight ?? 40;
    gantt.config.bar_height = options.barHeight ?? 22;
    gantt.config.scale_height = 56;
    gantt.config.resource_store = "resource";
    gantt.config.resource_property = "owner_id";

    if (scale === "week") {
        applyExecutiveTimelineScales(gantt);
        applyExecutiveGridPresentation(gantt);
    } else {
        gantt.config.columns = [
            { name: "text", label: "Task", tree: true, width: "*", min_width: 160, resize: true },
            { name: "start_date", label: "Start", align: "center", width: 90, resize: true },
            { name: "duration", label: "Days", align: "center", width: 60, resize: true },
            { name: "siteCode", label: "Site", align: "center", width: 70, resize: true }
        ];
        gantt.config.scales = scaleConfigsRef[scale] as typeof gantt.config.scales;
    }
    applyViewLayout(gantt, viewMode);

    gantt.config.work_time = true;
    gantt.config.correct_work_time = true;
    gantt.config.skip_off_time = false;

    if (flags.highlightWeekends) {
        gantt.templates.scale_cell_class = date => {
            if (date.getDay() === 0 || date.getDay() === 6) {
                return "dhl-gantt-weekend";
            }
            return "";
        };
        gantt.templates.timeline_cell_class = (_task, date) => {
            if (date.getDay() === 0 || date.getDay() === 6) {
                return "dhl-gantt-weekend";
            }
            return "";
        };
    }

    applyResourceTemplates(gantt);
    applyLightboxConfig(gantt);
    applyInlineEditors(gantt);

    if (flags.enableTooltips) {
        applyTooltipPlugin(gantt);
    }

    if (flags.showTodayMarker) {
        applyTodayMarker(gantt);
    }

    gantt.plugins({
        multiselect: flags.enableMultiselect,
        keyboard_navigation: flags.enableKeyboard,
        tooltip: flags.enableTooltips,
        marker: flags.showTodayMarker,
        fullscreen: true,
        grouping: true,
        auto_scheduling: features.isProFeatureEnabled("autoScheduling"),
        critical_path: features.isProFeatureEnabled("showCriticalPath"),
        undo: features.isProFeatureEnabled("enableUndo"),
        export_api: features.isProFeatureEnabled("enableExport")
    });

    gantt.config.resources = usesResourcePanel(viewMode);
    initZoomExtension(gantt);
}

function applyResourceTemplates(gantt: GanttStatic): void {
    const resourceCapacity = new Map<string, number>();

    gantt.templates.resource_cell_class = function resourceCellClass(
        _startDate: Date,
        _endDate: Date,
        resource: GanttResource,
        tasks: Array<{ id: string | number }>
    ) {
        const capacity = resource.capacity ?? resourceCapacity.get(String(resource.id));
        if (!capacity || capacity <= 0) {
            return "";
        }

        let load = 0;
        for (const taskRef of tasks) {
            const getAssignments = (gantt as GanttStatic & {
                getResourceAssignments?: (resourceId: string | number, taskId: string | number) => Array<{ value?: number }>;
            }).getResourceAssignments;
            const assignments = getAssignments?.call(gantt, resource.id, taskRef.id) ?? [];
            for (const assignment of assignments) {
                load += Number(assignment.value ?? 0);
            }
        }

        if (load > capacity) {
            return "dhl-gantt-resource-overallocated";
        }

        if (load >= capacity * 0.85) {
            return "dhl-gantt-resource-near-capacity";
        }

        return "";
    };

    gantt.templates.resource_cell_value = function resourceCellValue(
        _startDate: Date,
        _endDate: Date,
        resource: GanttResource,
        tasks: Array<{ id: string | number }>
    ) {
        if (resource.capacity !== undefined) {
            resourceCapacity.set(String(resource.id), resource.capacity);
        }

        let load = 0;
        for (const taskRef of tasks) {
            const getAssignments = (gantt as GanttStatic & {
                getResourceAssignments?: (resourceId: string | number, taskId: string | number) => Array<{ value?: number }>;
            }).getResourceAssignments;
            const assignments = getAssignments?.call(gantt, resource.id, taskRef.id) ?? [];
            for (const assignment of assignments) {
                load += Number(assignment.value ?? 0);
            }
        }

        return load > 0 ? String(Math.round(load * 10) / 10) : "";
    };
}

export function setGanttScale(gantt: GanttStatic, scale: GanttScale): void {
    if (scale === "week") {
        applyExecutiveTimelineScales(gantt);
        applyExecutiveGridPresentation(gantt);
    } else {
        gantt.config.scales = scaleConfigsRef[scale] as typeof gantt.config.scales;
    }
    gantt.render();
}

export { scaleConfigs } from "./scaleConfigs";
