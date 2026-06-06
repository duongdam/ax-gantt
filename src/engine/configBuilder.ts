import type { GanttStatic, Task } from "dhtmlx-gantt";

import type { ColumnDef, ColumnsPayload, MarkerPayload, ScalePayload } from "../store/types";
import type { GanttScale } from "../store/types";
import { getDefaultDhtmlxDateFormat } from "../utils/dates";
import { applyInlineEditors } from "./editors/inlineEditors";
import { applyLightboxConfig } from "./editors/lightboxConfig";
import { applyExecutiveGridPresentation, applyExecutiveTimelineScales } from "./executiveTimeline";
import type { FeatureRegistry } from "./FeatureRegistry";
import { applyTodayMarker } from "./plugins/markers";
import { applyTooltipPlugin } from "./plugins/tooltip";
import { applyScalePayload, applyTimelineBounds } from "./scaleBuilder";
import { scaleConfigs } from "./scaleConfigs";
import { applyViewLayout, type ViewMode } from "./viewLayouts";
import { initZoomExtension } from "./zoomConfig";

const scaleConfigsRef = scaleConfigs;

export interface AxGanttInteractionConfig {
    gridResize?: boolean;
    resizeRows?: boolean;
    sort?: boolean;
    clickDrag?: boolean;
    showAddTaskButton?: boolean;
    enableMarkers?: boolean;
}

export interface JsonGanttConfig {
    scale?: ScalePayload;
    columns?: ColumnsPayload;
    markers?: MarkerPayload;
    ganttStartDate?: Date;
    ganttEndDate?: Date;
    defaultExpandTree?: boolean;
    interaction?: AxGanttInteractionConfig;
}

export interface ApplyGanttConfigOptions {
    scale?: GanttScale;
    viewMode?: ViewMode;
    licenseKey?: string;
    rowHeight?: number;
    barHeight?: number;
    json?: JsonGanttConfig;
}

function applyJsonColumns(
    gantt: GanttStatic,
    payload: ColumnsPayload,
    interaction?: AxGanttInteractionConfig,
    readOnly = false
): void {
    const allowColumnResize = !readOnly && (interaction?.gridResize ?? true);
    const columns = payload.columns.map((col: ColumnDef) => ({
        name: col.name,
        label: col.label,
        tree: col.tree ?? false,
        width: col.width ?? "*",
        min_width: col.tree ? 220 : 80,
        resize: allowColumnResize && col.resize !== false,
        align: col.align ?? "left",
        template: col.template
            ? (task: Task) => {
                  const value = (task as Task & Record<string, unknown>)[col.template!];
                  return value !== undefined && value !== null ? String(value) : "";
              }
            : undefined
    }));

    if (!readOnly && interaction?.showAddTaskButton) {
        columns.push({
            name: "add",
            label: "",
            tree: false,
            width: 44,
            min_width: 44,
            resize: false,
            align: "center",
            template: undefined
        });
    }

    gantt.config.columns = columns;

    gantt.templates.grid_row_class = (_start, _end, task: Task) => {
        const level = (task as Task & { cf_level?: string }).cf_level;
        return level ? `axgantt-row--${level}` : "";
    };

    gantt.templates.task_class = (_start, _end, task: Task) => {
        const level = (task as Task & { cf_level?: string }).cf_level;
        return level ? `axgantt-bar--${level}` : "";
    };
}

export function applyGanttConfig(
    gantt: GanttStatic,
    features: FeatureRegistry,
    options: ApplyGanttConfigOptions = {}
): void {
    const flags = features.getFlags();
    const scale = options.scale ?? "week";
    const viewMode = options.viewMode ?? "project";
    const json = options.json;
    const interaction = json?.interaction;

    if (options.licenseKey?.trim()) {
        gantt.license = options.licenseKey.trim();
    }

    gantt.config.date_format = getDefaultDhtmlxDateFormat();
    gantt.config.xml_date = getDefaultDhtmlxDateFormat();
    gantt.config.smart_rendering = true;
    gantt.config.open_tree_initially = json?.defaultExpandTree ?? true;
    gantt.config.order_branch = !flags.readOnly;
    gantt.config.order_branch_free = !flags.readOnly;
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
    gantt.config.resize_rows = !flags.readOnly && (interaction?.resizeRows ?? true);
    gantt.config.sort = !flags.readOnly && (interaction?.sort ?? true);
    gantt.config.fit_tasks = true;
    gantt.config.row_height = options.rowHeight ?? 40;
    gantt.config.bar_height = options.barHeight ?? 22;
    gantt.config.scale_height = 56;

    if (json?.scale) {
        applyScalePayload(gantt, json.scale);
        if (json.columns) {
            applyJsonColumns(gantt, json.columns, interaction, flags.readOnly);
        }
        applyTimelineBounds(gantt, json.ganttStartDate, json.ganttEndDate);
    } else if (scale === "week") {
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
                return "axgantt-weekend";
            }
            return "";
        };
        gantt.templates.timeline_cell_class = (_task, date) => {
            if (date.getDay() === 0 || date.getDay() === 6) {
                return "axgantt-weekend";
            }
            return "";
        };
    }

    applyLightboxConfig(gantt);
    applyInlineEditors(gantt);

    if (flags.enableTooltips) {
        applyTooltipPlugin(gantt);
    }

    if (flags.showTodayMarker) {
        applyTodayMarker(gantt);
    }

    const enableClickDrag = !flags.readOnly && Boolean(interaction?.clickDrag);

    gantt.plugins({
        multiselect: flags.enableMultiselect,
        keyboard_navigation: flags.enableKeyboard,
        tooltip: flags.enableTooltips,
        marker: flags.showTodayMarker || Boolean(interaction?.enableMarkers),
        click_drag: enableClickDrag,
        fullscreen: true,
        grouping: true,
        auto_scheduling: features.isProFeatureEnabled("autoScheduling"),
        critical_path: features.isProFeatureEnabled("showCriticalPath"),
        undo: features.isProFeatureEnabled("enableUndo"),
        export_api: features.isProFeatureEnabled("enableExport")
    });

    if (enableClickDrag) {
        gantt.config.click_drag = gantt.config.click_drag ?? { singleRow: true };
    } else {
        gantt.config.click_drag = undefined;
    }

    gantt.config.resources = false;
    initZoomExtension(gantt);
}

export function setGanttScale(gantt: GanttStatic, scale: GanttScale, jsonScale?: ScalePayload): void {
    if (jsonScale) {
        applyScalePayload(gantt, jsonScale);
    } else if (scale === "week") {
        applyExecutiveTimelineScales(gantt);
        applyExecutiveGridPresentation(gantt);
    } else {
        gantt.config.scales = scaleConfigsRef[scale] as typeof gantt.config.scales;
    }
    gantt.render();
}

export { scaleConfigs } from "./scaleConfigs";
