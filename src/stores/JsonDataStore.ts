import { makeAutoObservable, runInAction } from "mobx";

import { parseColumnsJson } from "../adapters/parseColumnsJson";
import { parseMarkerJson } from "../adapters/parseMarkerJson";
import { parseScaleJson } from "../adapters/parseScaleJson";
import { parseTaskListJson } from "../adapters/parseTaskListJson";
import {
    type AxGanttParsedModel,
    type ColumnsPayload,
    DEFAULT_COLUMNS_PAYLOAD,
    DEFAULT_SCALE_PAYLOAD,
    type GanttTask,
    type MarkerPayload,
    type ScalePayload,
    emptyAxGanttModel
} from "./types";

export interface JsonDataInput {
    taskListJson?: string | null;
    scaleJson?: string | null;
    columnsJson?: string | null;
    markerJson?: string | null;
}

export class JsonDataStore {
    model: AxGanttParsedModel = emptyAxGanttModel();
    scale: ScalePayload = { ...DEFAULT_SCALE_PAYLOAD };
    columns: ColumnsPayload = { columns: [...DEFAULT_COLUMNS_PAYLOAD.columns] };
    markers: MarkerPayload = { markers: [] };
    parseError: string | null = null;
    parseWarnings: string[] = [];
    isLoading = false;
    lastParsedAt: number | null = null;
    lastActionContext: Record<string, unknown> | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get hasData(): boolean {
        return this.model.tasks.length > 0;
    }

    get isError(): boolean {
        return this.parseError !== null;
    }

    setLoading(loading: boolean): void {
        this.isLoading = loading;
    }

    loadFromJson(input: JsonDataInput): void {
        const taskResult = parseTaskListJson(input.taskListJson);
        const scaleResult = parseScaleJson(input.scaleJson);
        const columnsResult = parseColumnsJson(input.columnsJson);
        const markerResult = parseMarkerJson(input.markerJson);

        const allErrors = [
            ...taskResult.errors,
            ...scaleResult.errors,
            ...columnsResult.errors,
            ...markerResult.errors
        ];
        const allWarnings = [
            ...taskResult.warnings,
            ...scaleResult.warnings,
            ...columnsResult.warnings,
            ...markerResult.warnings
        ];

        runInAction(() => {
            this.scale = scaleResult.data;
            this.columns = columnsResult.data;
            this.markers = markerResult.data;
            this.parseWarnings = allWarnings;

            if (allErrors.length > 0) {
                this.parseError = allErrors.join("; ");
                this.model = emptyAxGanttModel();
            } else {
                this.parseError = null;
                this.model = taskResult.data;
                this.lastParsedAt = Date.now();
            }

            this.isLoading = false;
        });
    }

    reloadLayout(input: Pick<JsonDataInput, "scaleJson" | "columnsJson" | "markerJson">): void {
        const scaleResult = parseScaleJson(input.scaleJson);
        const columnsResult = parseColumnsJson(input.columnsJson);
        const markerResult = parseMarkerJson(input.markerJson);

        runInAction(() => {
            this.scale = scaleResult.data;
            this.columns = columnsResult.data;
            this.markers = markerResult.data;
            this.parseWarnings = [
                ...this.parseWarnings,
                ...scaleResult.warnings,
                ...columnsResult.warnings,
                ...markerResult.warnings
            ];
        });
    }

    setLastActionContext(context: Record<string, unknown> | object | null): void {
        this.lastActionContext = context as Record<string, unknown> | null;
    }

    findTaskById(id: string): GanttTask | undefined {
        return this.model.tasks.find(task => task.id === id);
    }

    addTask(task: GanttTask): void {
        if (!this.findTaskById(task.id)) {
            this.model.tasks.push(task);
        }
    }

    updateTask(taskId: string, patch: Partial<GanttTask>): void {
        const index = this.model.tasks.findIndex(task => task.id === taskId);
        if (index < 0) {
            return;
        }
        this.model.tasks[index] = { ...this.model.tasks[index], ...patch };
    }

    clear(): void {
        this.model = emptyAxGanttModel();
        this.parseError = null;
        this.parseWarnings = [];
        this.isLoading = false;
        this.lastParsedAt = null;
        this.lastActionContext = null;
    }
}
