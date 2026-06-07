import { makeAutoObservable } from "mobx";

import type { EditState, GanttScale, GanttTask, GanttViewState, UiMessage } from "./types";

const defaultViewState = (): GanttViewState => ({
    scale: "week",
    selectedTaskIds: [],
    selectedResourceIds: [],
    filters: {}
});

const defaultEditState = (): EditState => ({
    isDragging: false,
    isResizing: false,
    pendingChanges: [],
    undoAvailable: false,
    taskSnapshots: {}
});

export class GanttStore {
    view: GanttViewState = defaultViewState();
    edit: EditState = defaultEditState();
    uiMessage: UiMessage | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    setScale(scale: GanttScale): void {
        this.view.scale = scale;
    }

    setScrollDate(date: Date | undefined): void {
        this.view.scrollDate = date;
    }

    selectTask(id: string, multi = false): void {
        if (multi) {
            const idx = this.view.selectedTaskIds.indexOf(id);
            if (idx >= 0) {
                this.view.selectedTaskIds.splice(idx, 1);
            } else {
                this.view.selectedTaskIds.push(id);
            }
        } else {
            this.view.selectedTaskIds = [id];
        }
    }

    clearSelection(): void {
        this.view.selectedTaskIds = [];
        this.view.selectedResourceIds = [];
    }

    setDragging(isDragging: boolean): void {
        this.edit.isDragging = isDragging;
    }

    setResizing(isResizing: boolean): void {
        this.edit.isResizing = isResizing;
    }

    saveTaskSnapshot(task: GanttTask): void {
        this.edit.taskSnapshots[task.id] = { ...task };
    }

    getTaskSnapshot(taskId: string): GanttTask | undefined {
        return this.edit.taskSnapshots[taskId];
    }

    clearTaskSnapshot(taskId: string): void {
        delete this.edit.taskSnapshots[taskId];
    }

    showUiMessage(message: UiMessage): void {
        this.uiMessage = message;
    }

    clearUiMessage(): void {
        this.uiMessage = null;
    }
}
