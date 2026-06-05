import type { GanttStatic, Link, Task } from "dhtmlx-gantt";

import {
    buildLinkEventContext,
    buildResourceEventContext,
    buildTaskChangeContext,
    buildTaskEventContext
} from "../adapters/actionContext";
import { ganttTaskToModel } from "../adapters/mapTasksFromGantt";
import type { FeatureRegistry } from "./FeatureRegistry";
import type { GanttEngine } from "./GanttEngine";
import type { DatasourceStore } from "../store/DatasourceStore";
import type { GanttStore } from "../store/GanttStore";
import type { GanttScale } from "../store/types";

export interface EventBridgeActions {
    onTaskClickAction?: () => void;
    onTaskDblClickAction?: () => void;
    onTaskSelectedAction?: () => void;
    onScaleChangedAction?: (scale: GanttScale) => void;
    onTaskChangedAction?: () => boolean | Promise<boolean>;
    onBeforeTaskChangeAction?: () => boolean | Promise<boolean>;
    onTaskCreatedAction?: () => void;
    onTaskDeletedAction?: () => void;
    onLinkCreatedAction?: () => void;
    onLinkDeletedAction?: () => void;
    onLinkValidationFailedAction?: () => void;
    onResourceClickAction?: () => void;
}

export interface EventBridgeOptions extends EventBridgeActions {
    datasource: DatasourceStore;
    ganttStore: GanttStore;
    features: FeatureRegistry;
    engine?: GanttEngine;
    enableDetailDialog?: boolean;
}

export class EventBridge {
    private eventIds: string[] = [];

    attach(gantt: GanttStatic, options: EventBridgeOptions): void {
        this.detach(gantt);

        this.eventIds.push(
            gantt.attachEvent("onTaskClick", (taskId: string | number, event?: Event) => {
                this.handleTaskClick(String(taskId), event, options);
                return true;
            }),
            gantt.attachEvent("onTaskDblClick", (taskId: string | number) => {
                this.handleTaskDblClick(String(taskId), options);
                return true;
            }),
            gantt.attachEvent("onBeforeTaskDrag", (taskId: string | number) => {
                return this.handleBeforeTaskDrag(String(taskId), options);
            }),
            gantt.attachEvent("onAfterTaskDrag", (taskId: string | number) => {
                this.handleAfterTaskDrag(String(taskId), options);
            }),
            gantt.attachEvent("onBeforeTaskChanged", (taskId: string | number, _mode, task: Task) => {
                return this.handleBeforeTaskChanged(String(taskId), task, options);
            }),
            gantt.attachEvent("onAfterTaskUpdate", (taskId: string | number, task: Task) => {
                void this.handleAfterTaskUpdate(String(taskId), task, options);
            }),
            gantt.attachEvent("onAfterTaskAdd", (taskId: string | number) => {
                this.handleTaskCreated(String(taskId), options);
            }),
            gantt.attachEvent("onAfterTaskDelete", (taskId: string | number, task: Task) => {
                this.handleTaskDeleted(String(taskId), task, options);
            }),
            gantt.attachEvent("onBeforeLinkAdd", (_id, link: Link) => {
                return this.handleBeforeLinkAdd(link, options);
            }),
            gantt.attachEvent("onAfterLinkAdd", (id: string | number, link: Link) => {
                this.handleAfterLinkAdd(id, link, options);
            }),
            gantt.attachEvent("onAfterLinkDelete", (id: string | number) => {
                this.handleAfterLinkDelete(String(id), options);
            }),
            gantt.attachEvent("onCircularLinkError", (link: Link) => {
                this.handleLinkValidationFailed(String(link.source), String(link.target), "circular", options);
            }),
            gantt.attachEvent("onTaskRowClick", (id: string | number) => {
                const resourceStore = gantt.getDatastore(gantt.config.resource_store);
                if (resourceStore?.getItem(id)) {
                    this.handleResourceClick(String(id), options);
                }
            })
        );
    }

    detach(gantt: GanttStatic): void {
        for (const id of this.eventIds) {
            gantt.detachEvent(id);
        }
        this.eventIds = [];
    }

    notifyScaleChanged(scale: GanttScale, options: EventBridgeOptions): void {
        options.onScaleChangedAction?.(scale);
    }

    private handleTaskClick(taskId: string, event: Event | undefined, options: EventBridgeOptions): void {
        if (options.datasource.isLoading) {
            return;
        }

        const task = options.datasource.findTaskById(taskId);
        if (!task) {
            return;
        }

        options.ganttStore.selectTask(taskId);
        options.datasource.setLastActionContext(buildTaskEventContext(task));
        options.onTaskClickAction?.();
        options.onTaskSelectedAction?.();

        if (options.enableDetailDialog !== false && isTaskBarClick(event)) {
            options.datasource.openTaskDetailDialog(task);
        }
    }

    private handleTaskDblClick(taskId: string, options: EventBridgeOptions): void {
        const task = options.datasource.findTaskById(taskId);
        if (!task) {
            return;
        }

        options.datasource.setLastActionContext(buildTaskEventContext(task));
        options.onTaskDblClickAction?.();
    }

    private handleTaskCreated(taskId: string, options: EventBridgeOptions): void {
        const task = options.datasource.findTaskById(taskId);
        if (task) {
            options.datasource.setLastActionContext(buildTaskChangeContext(task, "create"));
        }
        options.onTaskCreatedAction?.();
    }

    private handleTaskDeleted(taskId: string, task: Task, options: EventBridgeOptions): void {
        options.datasource.setLastActionContext({
            taskId,
            taskLabel: String(task.text ?? taskId),
            entityType: "task"
        });
        options.onTaskDeletedAction?.();
    }

    private handleResourceClick(resourceId: string, options: EventBridgeOptions): void {
        const resource = options.datasource.findResourceById(resourceId);
        if (!resource) {
            return;
        }

        options.datasource.setLastActionContext(buildResourceEventContext(resource));
        options.onResourceClickAction?.();

        if (options.enableDetailDialog !== false) {
            options.datasource.openResourceDetailDialog(resource);
        }
    }

    private handleAfterLinkDelete(linkId: string, options: EventBridgeOptions): void {
        options.datasource.removeLink(linkId);
        options.onLinkDeletedAction?.();
    }

    private handleLinkValidationFailed(
        sourceTaskId: string,
        targetTaskId: string,
        reason: "circular" | "duplicate" | "readonly",
        options: EventBridgeOptions
    ): void {
        options.datasource.setLastActionContext({ sourceTaskId, targetTaskId, reason });
        options.ganttStore.showUiMessage({
            type: "error",
            code: "E002",
            text: "Circular dependency detected. Link was not created."
        });
        options.onLinkValidationFailedAction?.();
    }

    private handleBeforeTaskDrag(taskId: string, options: EventBridgeOptions): boolean {
        if (options.datasource.isLoading) {
            return false;
        }

        const storeTask = options.datasource.findTaskById(taskId);
        if (!options.features.isTaskEditable(storeTask)) {
            return false;
        }

        if (storeTask) {
            options.ganttStore.saveTaskSnapshot(storeTask);
        }
        options.ganttStore.setDragging(true);
        return true;
    }

    private handleAfterTaskDrag(taskId: string, options: EventBridgeOptions): void {
        options.ganttStore.setDragging(false);
        const gantt = options.engine?.getGantt();
        if (!gantt?.isTaskExists(taskId)) {
            return;
        }
        void this.handleAfterTaskUpdate(taskId, gantt.getTask(taskId), options, "move");
    }

    private handleBeforeTaskChanged(taskId: string, task: Task, options: EventBridgeOptions): boolean {
        const storeTask = options.datasource.findTaskById(taskId);
        if (!options.features.isTaskEditable(storeTask)) {
            return false;
        }

        const snapshot = options.ganttStore.getTaskSnapshot(taskId) ?? storeTask;
        if (snapshot?.version !== undefined && storeTask?.version !== undefined && snapshot.version !== storeTask.version) {
            options.ganttStore.showUiMessage({
                type: "error",
                code: "CONFLICT",
                text: "Task was modified by another user. Your changes were rejected."
            });
            return false;
        }

        if (options.onBeforeTaskChangeAction) {
            const allowed = options.onBeforeTaskChangeAction();
            if (allowed === false) {
                return false;
            }
        }

        if (storeTask && task.readonly) {
            return false;
        }

        return true;
    }

    private async handleAfterTaskUpdate(
        taskId: string,
        task: Task,
        options: EventBridgeOptions,
        changeType: "move" | "resize" | "progress" | "text" = "move"
    ): Promise<void> {
        const existing = options.datasource.findTaskById(taskId);
        const updated = ganttTaskToModel(task, existing);
        const snapshot = options.ganttStore.getTaskSnapshot(taskId) ?? existing;

        options.datasource.updateTask(taskId, updated);
        options.datasource.setLastActionContext(buildTaskChangeContext(updated, changeType, snapshot));

        const committed = await this.commitTaskChange(options);
        if (!committed) {
            this.rollbackTask(taskId, snapshot, options);
            return;
        }

        options.onTaskChangedAction?.();
        options.ganttStore.clearTaskSnapshot(taskId);
    }

    private async commitTaskChange(options: EventBridgeOptions): Promise<boolean> {
        if (!options.onTaskChangedAction) {
            return true;
        }

        try {
            const result = await options.onTaskChangedAction();
            return result !== false;
        } catch {
            return false;
        }
    }

    private rollbackTask(
        taskId: string,
        snapshot: ReturnType<DatasourceStore["findTaskById"]>,
        options: EventBridgeOptions
    ): void {
        if (!snapshot) {
            return;
        }

        options.datasource.updateTask(taskId, snapshot);
        options.engine?.rollbackTask(snapshot);
        options.ganttStore.showUiMessage({
            type: "error",
            text: "Changes could not be saved. The task was restored to its previous state."
        });
        options.ganttStore.clearTaskSnapshot(taskId);
    }

    private handleBeforeLinkAdd(link: Link, options: EventBridgeOptions): boolean {
        if (options.datasource.isLoading || !options.features.getFlags().enableLinkDraw) {
            return false;
        }

        if (link.source === link.target) {
            this.handleLinkValidationFailed(String(link.source), String(link.target), "duplicate", options);
            return false;
        }

        return true;
    }

    private handleAfterLinkAdd(_id: string | number, link: Link, options: EventBridgeOptions): void {
        const mapped = {
            id: String(link.id),
            source: String(link.source),
            target: String(link.target),
            type: Number(link.type) as 0 | 1 | 2 | 3,
            lag: link.lag ?? 0
        };
        options.datasource.addLink(mapped);
        options.datasource.setLastActionContext(buildLinkEventContext(mapped));
        options.onLinkCreatedAction?.();
    }
}

export function createEventBridge(): EventBridge {
    return new EventBridge();
}

/** True when the click target is a task bar on the timeline, not a grid row. */
function isTaskBarClick(event?: Event | null): boolean {
    if (!event?.target || !(event.target instanceof Element)) {
        return false;
    }

    return Boolean(
        event.target.closest(".gantt_task_line, .gantt_task_content, .gantt_milestone")
    );
}
