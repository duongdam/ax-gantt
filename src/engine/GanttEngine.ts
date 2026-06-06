import { gantt, type GanttStatic } from "dhtmlx-gantt";

import { mapModelToDhtmlx } from "../adapters/mapAxGanttModel";
import { modelTaskToGanttPatch } from "../adapters/mapTasksFromGantt";
import type { AxGanttParsedModel, GanttNormalizedModel, GanttTask } from "../store/types";
import type { ScalePayload } from "../store/types";
import { applyGanttConfig, type JsonGanttConfig, setGanttScale } from "./configBuilder";
import type { FeatureRegistry } from "./FeatureRegistry";
import { applyJsonMarkers, refreshTodayMarker } from "./plugins/markers";
import type { GanttScale } from "../store/types";
import { getAdjacentScale } from "./zoomConfig";
import type { ViewMode } from "./viewLayouts";

export interface GanttEngineInitOptions {
    scale?: GanttScale;
    viewMode?: ViewMode;
    licenseKey?: string;
    rowHeight?: number;
    barHeight?: number;
    json?: JsonGanttConfig;
}

export interface GanttParseOptions {
    viewMode?: ViewMode;
}

export class GanttEngine {
    private initialized = false;
    private contextMenuHandlerId: string | null = null;
    private viewMode: ViewMode = "project";

    /**
     * Initializes dhtmlx Gantt. Call only when the container is mounted and data is ready
     * (deferred init — do not call while isLoading).
     */
    init(container: HTMLElement, features: FeatureRegistry, options: GanttEngineInitOptions = {}): void {
        if (this.initialized) {
            return;
        }

        this.viewMode = options.viewMode ?? "project";
        applyGanttConfig(gantt, features, {
            scale: options.scale ?? "week",
            viewMode: this.viewMode,
            licenseKey: options.licenseKey,
            rowHeight: options.rowHeight,
            barHeight: options.barHeight,
            json: options.json
        });
        gantt.init(container);
        this.configureContextMenu(features);
        this.initialized = true;
    }

    setViewMode(viewMode: ViewMode, features: FeatureRegistry, scale: GanttScale = "week"): void {
        if (!this.initialized || this.viewMode === viewMode) {
            this.viewMode = viewMode;
            return;
        }

        this.viewMode = viewMode;
        applyGanttConfig(gantt, features, { scale, viewMode: this.viewMode });
        gantt.resetLayout();
        gantt.render();
    }

    getViewMode(): ViewMode {
        return this.viewMode;
    }

    applyJsonConfig(features: FeatureRegistry, json: JsonGanttConfig): void {
        if (!this.initialized) {
            return;
        }
        applyGanttConfig(gantt, features, {
            scale: "week",
            viewMode: this.viewMode,
            json
        });
        applyJsonMarkers(gantt, json.markers, Boolean(json.interaction?.enableMarkers));
        gantt.render();
    }

    parseAxGanttModel(
        model: AxGanttParsedModel,
        options?: { defaultExpandTree?: boolean; json?: JsonGanttConfig }
    ): void {
        const normalized: GanttNormalizedModel = {
            tasks: model.tasks,
            links: model.links,
            resources: [],
            assignments: []
        };
        this.parse(normalized, { viewMode: "project" });

        if (options?.defaultExpandTree !== false) {
            gantt.eachTask(task => {
                if (task.type === "project") {
                    task.open = true;
                }
            });
        }

        if (options?.json) {
            applyJsonMarkers(gantt, options.json.markers, Boolean(options.json.interaction?.enableMarkers));
        }

        gantt.render();
    }

    parse(model: GanttNormalizedModel, options?: GanttParseOptions): void {
        if (!this.initialized) {
            return;
        }

        if (options?.viewMode && options.viewMode !== this.viewMode) {
            this.viewMode = options.viewMode;
        }

        const payload = mapModelToDhtmlx(model);
        gantt.clearAll();
        gantt.parse(payload);
        refreshTodayMarker(gantt);
    }

    setScale(scale: GanttScale, jsonScale?: ScalePayload): void {
        if (!this.initialized) {
            return;
        }
        setGanttScale(gantt, scale, jsonScale);
        if (gantt.ext?.zoom?.setLevel) {
            gantt.ext.zoom.setLevel(scale);
        }
    }

    zoomIn(currentScale: GanttScale): GanttScale {
        if (!this.initialized) {
            return currentScale;
        }
        if (gantt.ext?.zoom?.zoomIn) {
            gantt.ext.zoom.zoomIn();
            return getAdjacentScale(currentScale, "in");
        }
        const next = getAdjacentScale(currentScale, "in");
        this.setScale(next);
        return next;
    }

    zoomOut(currentScale: GanttScale): GanttScale {
        if (!this.initialized) {
            return currentScale;
        }
        if (gantt.ext?.zoom?.zoomOut) {
            gantt.ext.zoom.zoomOut();
            return getAdjacentScale(currentScale, "out");
        }
        const next = getAdjacentScale(currentScale, "out");
        this.setScale(next);
        return next;
    }

    fitTasks(): void {
        if (!this.initialized) {
            return;
        }
        gantt.config.fit_tasks = true;
        gantt.render();
    }

    scrollToToday(): void {
        if (!this.initialized) {
            return;
        }
        gantt.showDate(new Date());
        refreshTodayMarker(gantt);
    }

    scrollToDate(date: Date): void {
        if (!this.initialized) {
            return;
        }
        gantt.showDate(date);
    }

    toggleFullscreen(): void {
        if (!this.initialized || !gantt.ext?.fullscreen) {
            return;
        }
        if (gantt.ext.fullscreen.isFullscreen()) {
            gantt.ext.fullscreen.exit();
        } else {
            gantt.ext.fullscreen.request();
        }
    }

    indentTask(taskId: string): boolean {
        if (!this.initialized) {
            return false;
        }
        const prevId = gantt.getPrevSibling(taskId);
        if (!prevId) {
            return false;
        }
        gantt.moveTask(taskId, gantt.getChildren(prevId).length, prevId);
        return true;
    }

    outdentTask(taskId: string): boolean {
        if (!this.initialized) {
            return false;
        }
        const parentId = gantt.getParent(taskId);
        if (!parentId || parentId === gantt.config.root_id) {
            return false;
        }
        const grandParent = gantt.getParent(parentId);
        const targetParent = grandParent ?? gantt.config.root_id;
        const insertIndex = gantt.getTaskIndex(parentId) + 1;
        gantt.moveTask(taskId, insertIndex, targetParent);
        return true;
    }

    rollbackTask(task: GanttTask): void {
        if (!this.initialized || !gantt.isTaskExists(task.id)) {
            return;
        }
        gantt.updateTask(task.id, modelTaskToGanttPatch(task));
        gantt.refreshTask(task.id);
    }

    showLightbox(taskId: string): void {
        if (this.initialized && gantt.isTaskExists(taskId)) {
            gantt.showLightbox(taskId);
        }
    }

    deleteTask(taskId: string): void {
        if (this.initialized && gantt.isTaskExists(taskId)) {
            gantt.deleteTask(taskId);
        }
    }

    getGantt(): GanttStatic {
        return gantt;
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    destroy(): void {
        if (!this.initialized) {
            return;
        }

        if (this.contextMenuHandlerId) {
            gantt.detachEvent(this.contextMenuHandlerId);
            this.contextMenuHandlerId = null;
        }

        gantt.clearAll();
        gantt.destructor();
        this.initialized = false;
    }

    private configureContextMenu(features: FeatureRegistry): void {
        this.contextMenuHandlerId = gantt.attachEvent("onContextMenu", (taskId, _linkId, event) => {
            if (!taskId || features.getFlags().readOnly) {
                return true;
            }

            const task = gantt.getTask(taskId);
            if (!features.isTaskEditable({ readonly: Boolean(task.readonly) })) {
                return false;
            }

            event.preventDefault();
            const menu = document.createElement("div");
            menu.className = "dhl-gantt-context-menu";
            menu.style.position = "fixed";
            menu.style.left = `${(event as MouseEvent).clientX}px`;
            menu.style.top = `${(event as MouseEvent).clientY}px`;
            menu.innerHTML = `
                <button type="button" data-action="edit">Edit</button>
                <button type="button" data-action="indent">Indent</button>
                <button type="button" data-action="outdent">Outdent</button>
                <button type="button" data-action="delete">Delete</button>
            `;

            const close = (): void => {
                menu.remove();
                document.removeEventListener("click", close);
            };

            menu.addEventListener("click", e => {
                const target = e.target as HTMLElement;
                const action = target.dataset.action;
                const id = String(taskId);
                if (action === "edit") {
                    this.showLightbox(id);
                } else if (action === "indent") {
                    this.indentTask(id);
                } else if (action === "outdent") {
                    this.outdentTask(id);
                } else if (action === "delete") {
                    this.deleteTask(id);
                }
                close();
            });

            document.body.appendChild(menu);
            setTimeout(() => document.addEventListener("click", close), 0);
            return false;
        });
    }
}

export function createGanttEngine(): GanttEngine {
    return new GanttEngine();
}
