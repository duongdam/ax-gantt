import { makeAutoObservable, runInAction } from "mobx";

import { loadMockDatasource, type MockLoadOptions } from "../mock/datasources";
import type { GanttLink, GanttNormalizedModel, GanttResource, GanttTask, SelectedGanttItem } from "./types";
import { buildTaskSelectedItem } from "../adapters/taskSelection";
import { buildResourceEventContext } from "../adapters/actionContext";
import { emptyModel } from "./types";

export class DatasourceStore {
    model: GanttNormalizedModel = emptyModel();
    isLoading = false;
    error: string | null = null;
    lastLoadedAt: number | null = null;
    lastLoadOptions: MockLoadOptions = { delayMs: 600 };
    dialog = { open: false, item: null as SelectedGanttItem | null };
    lastActionContext: Record<string, unknown> | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get hasData(): boolean {
        return this.model.tasks.length > 0;
    }

    get isError(): boolean {
        return this.error !== null;
    }

    setModel(model: GanttNormalizedModel): void {
        this.model = model;
        this.lastLoadedAt = Date.now();
        this.error = null;
        this.isLoading = false;
    }

    setLoading(loading: boolean): void {
        this.isLoading = loading;
    }

    setError(message: string | null): void {
        this.error = message;
        this.isLoading = false;
    }

    async load(options?: MockLoadOptions): Promise<void> {
        this.lastLoadOptions = { delayMs: 600, ...options };
        this.isLoading = true;
        this.error = null;

        try {
            const bundle = await loadMockDatasource(this.lastLoadOptions);
            runInAction(() => {
                this.model = {
                    tasks: bundle.tasks,
                    links: bundle.links,
                    resources: bundle.resources,
                    assignments: bundle.assignments
                };
                this.lastLoadedAt = Date.now();
                this.isLoading = false;
            });
        } catch (e) {
            runInAction(() => {
                this.error = e instanceof Error ? e.message : "Unknown error";
                this.isLoading = false;
            });
        }
    }

    retryLoad(): Promise<void> {
        return this.load(this.lastLoadOptions);
    }

    openDetailDialog(item: SelectedGanttItem): void {
        this.dialog = { open: true, item };
    }

    openTaskDetailDialog(task: GanttTask): void {
        this.openDetailDialog(buildTaskSelectedItem(task));
    }

    openResourceDetailDialog(resource: GanttResource): void {
        const context = buildResourceEventContext(resource);
        this.openDetailDialog({
            entityType: "resource",
            id: resource.id,
            label: resource.name,
            raw: { ...context, ...(resource.custom ?? {}) }
        });
    }

    setLastActionContext(context: Record<string, unknown> | object | null): void {
        this.lastActionContext = context as Record<string, unknown> | null;
    }

    closeDetailDialog(): void {
        this.dialog = { open: false, item: null };
    }

    findTaskById(id: string): GanttTask | undefined {
        return this.model.tasks.find(t => t.id === id);
    }

    findResourceById(id: string): GanttResource | undefined {
        return this.model.resources.find(r => r.id === id);
    }

    updateTask(taskId: string, patch: Partial<GanttTask>): void {
        const index = this.model.tasks.findIndex(task => task.id === taskId);
        if (index < 0) {
            return;
        }
        this.model.tasks[index] = { ...this.model.tasks[index], ...patch };
    }

    addLink(link: GanttLink): void {
        if (this.model.links.some(existing => existing.id === link.id)) {
            return;
        }
        this.model.links.push(link);
    }

    removeLink(linkId: string): void {
        this.model.links = this.model.links.filter(link => link.id !== linkId);
    }

    validateTaskVersion(taskId: string, expectedVersion?: string | number): boolean {
        const task = this.findTaskById(taskId);
        if (!task || expectedVersion === undefined) {
            return true;
        }
        return task.version === expectedVersion;
    }
}
