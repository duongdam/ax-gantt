export type DimensionKey =
    | "time"
    | "site"
    | "project"
    | "resource"
    | "sourceSystem"
    | "department"
    | "status";

export type CrossFilterMode = "and" | "or";
export type FilterMode = "client" | "server";
export type FilterIncludeMode = "include" | "exclude";

export interface DimensionDefinition {
    key: DimensionKey;
    enabled: boolean;
    groupBy: boolean;
    showInGrid: boolean;
    showInFilterBar: boolean;
    label?: string;
}

export interface DimensionFilter {
    key: DimensionKey;
    values: string[];
    mode: FilterIncludeMode;
}

export interface DimensionTimeRange {
    from?: Date;
    to?: Date;
}

export interface DimensionStoreState {
    definitions: DimensionDefinition[];
    filters: DimensionFilter[];
    crossFilterMode: CrossFilterMode;
    primaryGroupDimension: DimensionKey | null;
    filterMode: FilterMode;
    timeRange: DimensionTimeRange;
}

export { defaultDimensionDefinitions } from "./DimensionRegistry";
