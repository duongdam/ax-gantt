import type { GanttStatic, Task } from "dhtmlx-gantt";

import { buildTaskChangeContext, buildTaskEventContext, type AxGanttChangeType } from "../adapters/actionContext";
import { ganttTaskToModel } from "../adapters/mapTasksFromGantt";
import type { FeatureRegistry } from "./FeatureRegistry";
import type { GanttEngine } from "./GanttEngine";
import type { GanttStore } from "../stores/GanttStore";
import type { JsonDataStore } from "../stores/JsonDataStore";
import type { GanttTask } from "../stores/types";

export interface EventBridgeActions {
    onTaskDbClickAction?: () => void;
    onTaskMoveAction?: () => boolean | Promise<boolean>;
    onTaskResizeAction?: () => boolean | Promise<boolean>;
    onTaskCreateAction?: () => void;
    onTaskSelectAction?: () => void;
    onTaskRowDragAction?: () => boolean | Promise<boolean>;
    onTaskCheckAction?: () => void;
    onTaskUndoAction?: () => void;
}

export interface EventBridgeOptions extends EventBridgeActions {
    jsonData: JsonDataStore;
    ganttStore: GanttStore;
    features: FeatureRegistry;
    engine?: GanttEngine;
}

export class EventBridge {
    private eventIds: string[] = [];

    attach(gantt: GanttStatic, options: EventBridgeOptions): void {
        this.detach(gantt);

        if (options.onTaskUndoAction) {
            gantt.plugins({ undo: true });
        }

        this.eventIds.push(
            gantt.attachEvent("onTaskDblClick", (taskId: string | number) => {
                this.handleTaskDbClick(String(taskId), options);
                return true;
            }),
            gantt.attachEvent("onBeforeTaskDrag", (taskId: string | number, mode: string) => {
                return this.handleBeforeTaskDrag(String(taskId), options, mode);
            }),
            gantt.attachEvent("onAfterTaskDrag", (taskId: string | number, mode: string) => {
                this.handleAfterTaskChange(String(taskId), options, resolveDragChangeType(mode)).catch(
                    () => undefined
                );
            }),
            gantt.attachEvent("onBeforeRowDragEnd", (taskId: string | number) => {
                return this.handleBeforeRowDrag(String(taskId), options);
            }),
            gantt.attachEvent("onTaskCreated", (task: Task) => {
                this.handleTaskCreate(String(task.id), options);
                return true;
            }),
            gantt.attachEvent("onRowDragEnd", (taskId: string | number) => {
                this.handleTaskRowDrag(String(taskId), options).catch(() => undefined);
            })
        );

        if (options.onTaskSelectAction) {
            const selectEvent = options.features.isEnabled("enableMultiselect") ? "onTaskSelected" : "onTaskClick";
            this.eventIds.push(
                gantt.attachEvent(selectEvent, (taskId: string | number) => {
                    this.handleTaskSelect(String(taskId), options);
                    return true;
                })
            );
        }

        if (options.onTaskCheckAction) {
            this.eventIds.push(
                gantt.attachEvent("onAfterTaskUpdate", (taskId: string | number, task: Task) => {
                    const id = String(taskId);
                    const previous = options.jsonData.findTaskById(id);
                    const prevChecked = readCheckboxValue(previous);
                    const nextChecked = readCheckboxValue(task);
                    if (prevChecked === nextChecked) {
                        return;
                    }
                    const updated = ganttTaskToModel(task, previous);
                    options.jsonData.updateTask(id, updated);
                    this.handleTaskCheck(id, options);
                })
            );
        }

        if (options.onTaskUndoAction) {
            this.eventIds.push(
                gantt.attachEvent("onAfterUndo", () => {
                    options.jsonData.setLastActionContext({ changeType: "undo" });
                    options.onTaskUndoAction?.();
                    return true;
                }),
                gantt.attachEvent("onAfterRedo", () => {
                    options.jsonData.setLastActionContext({ changeType: "redo" });
                    options.onTaskUndoAction?.();
                    return true;
                })
            );
        }
    }

    detach(gantt: GanttStatic): void {
        for (const id of this.eventIds) {
            gantt.detachEvent(id);
        }
        this.eventIds = [];
    }

    private handleTaskDbClick(taskId: string, options: EventBridgeOptions): void {
        if (options.jsonData.isLoading) {
            return;
        }

        const task = options.jsonData.findTaskById(taskId);
        if (!task) {
            return;
        }

        options.ganttStore.selectTask(taskId);
        options.jsonData.setLastActionContext(buildTaskEventContext(task));
        options.onTaskDbClickAction?.();
    }

    private handleTaskSelect(taskId: string, options: EventBridgeOptions): void {
        if (options.jsonData.isLoading) {
            return;
        }

        const task = options.jsonData.findTaskById(taskId);
        if (!task) {
            return;
        }

        options.ganttStore.selectTask(taskId);
        options.jsonData.setLastActionContext(buildTaskEventContext(task));
        options.onTaskSelectAction?.();
    }

    private handleTaskCreate(taskId: string, options: EventBridgeOptions): void {
        const gantt = options.engine?.getGantt();
        let task = options.jsonData.findTaskById(taskId);

        if (!task && gantt?.isTaskExists(taskId)) {
            task = ganttTaskToModel(gantt.getTask(taskId));
            options.jsonData.addTask(task);
        }

        if (task) {
            options.jsonData.setLastActionContext(buildTaskChangeContext(task, "create"));
        }
        options.onTaskCreateAction?.();
    }

    private handleBeforeRowDrag(taskId: string, options: EventBridgeOptions): boolean {
        if (options.jsonData.isLoading || options.features.getFlags().readOnly) {
            return false;
        }

        const storeTask = options.jsonData.findTaskById(taskId);
        if (!options.features.isTaskEditable(storeTask)) {
            return false;
        }

        if (storeTask) {
            options.ganttStore.saveTaskSnapshot(storeTask);
        }
        return true;
    }

    private async handleTaskRowDrag(taskId: string, options: EventBridgeOptions): Promise<void> {
        const gantt = options.engine?.getGantt();
        if (!gantt?.isTaskExists(taskId)) {
            return;
        }

        const existing = options.jsonData.findTaskById(taskId);
        const updated = ganttTaskToModel(gantt.getTask(taskId), existing);
        const snapshot = options.ganttStore.getTaskSnapshot(taskId) ?? existing;

        options.jsonData.updateTask(taskId, updated);
        options.jsonData.setLastActionContext(buildTaskChangeContext(updated, "rowDrag", snapshot));

        const committed = await this.commitAction(options.onTaskRowDragAction);
        if (!committed) {
            this.rollbackTask(taskId, snapshot, options, "rowDrag");
            return;
        }

        options.ganttStore.clearTaskSnapshot(taskId);
    }

    private handleTaskCheck(taskId: string, options: EventBridgeOptions): void {
        const task = options.jsonData.findTaskById(taskId);
        if (task) {
            options.jsonData.setLastActionContext(buildTaskEventContext(task));
        }
        options.onTaskCheckAction?.();
    }

    private handleBeforeTaskDrag(taskId: string, options: EventBridgeOptions, mode: string): boolean {
        if (options.jsonData.isLoading) {
            return false;
        }

        if (!isDragModeAllowed(mode, options.features)) {
            return false;
        }

        const storeTask = options.jsonData.findTaskById(taskId);
        if (!options.features.isTaskEditable(storeTask)) {
            return false;
        }

        if (storeTask) {
            options.ganttStore.saveTaskSnapshot(storeTask);
        }
        options.ganttStore.setDragging(true);
        return true;
    }

    private async handleAfterTaskChange(
        taskId: string,
        options: EventBridgeOptions,
        changeType: AxGanttChangeType
    ): Promise<void> {
        options.ganttStore.setDragging(false);

        const gantt = options.engine?.getGantt();
        if (!gantt?.isTaskExists(taskId)) {
            return;
        }

        const existing = options.jsonData.findTaskById(taskId);
        const updated = ganttTaskToModel(gantt.getTask(taskId), existing);
        const snapshot = options.ganttStore.getTaskSnapshot(taskId) ?? existing;

        options.jsonData.updateTask(taskId, updated);
        options.jsonData.setLastActionContext(buildTaskChangeContext(updated, changeType, snapshot));

        const action = resolveChangeAction(changeType, options);
        const committed = await this.commitAction(action);

        if (!committed) {
            this.rollbackTask(taskId, snapshot, options, changeType);
            return;
        }

        options.ganttStore.clearTaskSnapshot(taskId);
    }

    private async commitAction(action?: () => boolean | Promise<boolean>): Promise<boolean> {
        if (!action) {
            return true;
        }

        try {
            const result = await action();
            return result !== false;
        } catch {
            return false;
        }
    }

    private rollbackTask(
        taskId: string,
        snapshot: GanttTask | undefined,
        options: EventBridgeOptions,
        changeType: AxGanttChangeType
    ): void {
        if (!snapshot) {
            return;
        }

        options.jsonData.updateTask(taskId, snapshot);
        options.jsonData.setLastActionContext(buildTaskChangeContext(snapshot, changeType, snapshot, true));
        options.engine?.rollbackTask(snapshot);
        options.ganttStore.showUiMessage({
            type: "error",
            text: "Changes could not be saved. The task was restored to its previous state."
        });
        options.ganttStore.clearTaskSnapshot(taskId);
    }
}

export function createEventBridge(): EventBridge {
    return new EventBridge();
}

function resolveDragChangeType(mode: string): AxGanttChangeType {
    if (mode === "resize") {
        return "resize";
    }
    if (mode === "progress") {
        return "progress";
    }
    return "move";
}

function isDragModeAllowed(mode: string, features: FeatureRegistry): boolean {
    if (mode === "resize") {
        return features.isEnabled("enableResize");
    }
    if (mode === "progress") {
        return features.isEnabled("enableProgressDrag");
    }
    return features.isEnabled("enableDragMove");
}

function resolveChangeAction(
    changeType: AxGanttChangeType,
    options: EventBridgeOptions
): (() => boolean | Promise<boolean>) | undefined {
    if (changeType === "resize" || changeType === "progress") {
        return options.onTaskResizeAction;
    }
    return options.onTaskMoveAction;
}

function readCheckboxValue(source?: { custom?: Record<string, unknown> } | Task): boolean | undefined {
    if (!source) {
        return undefined;
    }
    const record = source as Record<string, unknown>;
    const custom = (record.custom as Record<string, unknown> | undefined) ?? {};
    if (typeof custom.checked === "boolean") {
        return custom.checked;
    }
    if (typeof custom.chosen === "boolean") {
        return custom.chosen;
    }
    if (typeof record.checked === "boolean") {
        return record.checked;
    }
    if (typeof record.chosen === "boolean") {
        return record.chosen;
    }
    return undefined;
}
