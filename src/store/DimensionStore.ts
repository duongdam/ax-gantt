import { makeAutoObservable, runInAction } from "mobx";

import { dimensionSlicer, countMatchingTasks } from "../dimensions/dimensionSlicer";
import { enrichTaskDimensions } from "../dimensions/DimensionRegistry";
import {
    defaultDimensionDefinitions,
    type CrossFilterMode,
    type DimensionFilter,
    type DimensionKey,
    type FilterMode
} from "../dimensions/dimensionTypes";
import type { GanttNormalizedModel } from "./types";

const DEBOUNCE_MS = 300;

export class DimensionStore {
    definitions = [...defaultDimensionDefinitions];
    filters: DimensionFilter[] = [];
    appliedFilters: DimensionFilter[] = [];
    crossFilterMode: CrossFilterMode = "and";
    primaryGroupDimension: DimensionKey | null = null;
    filterMode: FilterMode = "client";
    timeRange: { from?: Date; to?: Date } = {};
    appliedTimeRange: { from?: Date; to?: Date } = {};
    sliceVersion = 0;
    segmentRootId: string | null = null;
    appliedSegmentRootId: string | null = null;

    private debounceTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get hasActiveFilters(): boolean {
        return (
            this.appliedFilters.some(filter => filter.values.length > 0) ||
            this.appliedTimeRange.from !== undefined ||
            this.appliedTimeRange.to !== undefined ||
            this.appliedSegmentRootId !== null
        );
    }

    setFilter(key: DimensionKey, values: string[]): void {
        const existing = this.filters.find(filter => filter.key === key);
        if (existing) {
            existing.values = values;
        } else {
            this.filters.push({ key, values, mode: "include" });
        }
        this.scheduleApply();
    }

    toggleFilterValue(key: DimensionKey, value: string): void {
        const existing = this.filters.find(filter => filter.key === key);
        const currentValues = existing?.values ?? [];
        const nextValues = currentValues.includes(value)
            ? currentValues.filter(item => item !== value)
            : [...currentValues, value];
        this.setFilter(key, nextValues);
    }

    clearFilter(key: DimensionKey): void {
        this.filters = this.filters.filter(filter => filter.key !== key);
        this.scheduleApply();
    }

    clearAllFilters(): void {
        this.filters = [];
        this.timeRange = {};
        this.segmentRootId = null;
        this.scheduleApply();
    }

    setCrossFilterMode(mode: CrossFilterMode): void {
        this.crossFilterMode = mode;
        this.scheduleApply();
    }

    setPrimaryGroupDimension(key: DimensionKey | null): void {
        this.primaryGroupDimension = key;
    }

    setFilterMode(mode: FilterMode): void {
        this.filterMode = mode;
    }

    setTimeRange(from?: Date, to?: Date): void {
        this.timeRange = { from, to };
        this.scheduleApply();
    }

    selectWeek(start: Date, end: Date): void {
        this.timeRange = { from: start, to: end };
        this.filters = this.filters.filter(filter => filter.key !== "project");
        this.segmentRootId = null;
        this.scheduleApply();
    }

    selectProjectSegment(taskId: string | null): void {
        this.segmentRootId = taskId;
        this.scheduleApply();
    }

    getSelectedProjectId(): string | null {
        return this.segmentRootId;
    }

    private filterBySegmentRoot(model: GanttNormalizedModel): GanttNormalizedModel {
        const rootId = this.appliedSegmentRootId;
        if (!rootId) {
            return model;
        }

        const byId = new Map(model.tasks.map(task => [task.id, task]));
        const keepIds = new Set<string>();

        const includeWithAncestors = (taskId: string): void => {
            let current = byId.get(taskId);
            while (current) {
                keepIds.add(current.id);
                if (!current.parentId) {
                    break;
                }
                current = byId.get(current.parentId);
            }
        };

        for (const task of model.tasks) {
            let cursor: typeof task | undefined = task;
            while (cursor) {
                if (cursor.id === rootId) {
                    includeWithAncestors(task.id);
                    break;
                }
                cursor = cursor.parentId ? byId.get(cursor.parentId) : undefined;
            }
        }

        includeWithAncestors(rootId);

        return {
            ...model,
            tasks: model.tasks.filter(task => keepIds.has(task.id)),
            links: model.links.filter(link => keepIds.has(link.source) && keepIds.has(link.target)),
            assignments: model.assignments.filter(assignment => keepIds.has(assignment.taskId))
        };
    }

    getSlicedModel(model: GanttNormalizedModel): GanttNormalizedModel {
        if (this.filterMode === "server") {
            return model;
        }

        const sliced = dimensionSlicer(model, {
            filters: this.appliedFilters,
            crossFilterMode: this.crossFilterMode,
            timeRange: this.appliedTimeRange
        });

        return enrichTaskDimensions(this.filterBySegmentRoot(sliced));
    }

    getVisibleTaskCount(model: GanttNormalizedModel): number {
        if (this.filterMode === "server") {
            return model.tasks.filter(task => task.type !== "project").length;
        }

        return countMatchingTasks(model, {
            filters: this.appliedFilters,
            crossFilterMode: this.crossFilterMode,
            timeRange: this.appliedTimeRange
        });
    }

    private scheduleApply(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            runInAction(() => {
                this.appliedFilters = this.filters.map(filter => ({ ...filter, values: [...filter.values] }));
                this.appliedTimeRange = { ...this.timeRange };
                this.appliedSegmentRootId = this.segmentRootId;
                this.sliceVersion += 1;
            });
        }, DEBOUNCE_MS);
    }
}
