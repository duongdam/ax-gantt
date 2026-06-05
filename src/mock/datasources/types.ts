import type { GanttNormalizedModel } from "../../store/types";

export type MockScenario = "default" | "multiSite" | "empty" | "performance";

export interface MockLoadOptions {
    delayMs?: number;
    shouldFail?: boolean;
    scenario?: MockScenario;
}

export type MockDatasourceBundle = GanttNormalizedModel;
