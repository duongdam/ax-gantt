import { getEmptyScenario } from "./scenarios/empty";
import { getMultiSiteScenario } from "./scenarios/multiSite";
import { getPerformanceScenario } from "./scenarios/performance";
import type { MockLoadOptions, MockDatasourceBundle } from "./types";

export type { MockLoadOptions, MockDatasourceBundle, MockScenario } from "./types";

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export async function loadMockDatasource(options: MockLoadOptions = {}): Promise<MockDatasourceBundle> {
    const { delayMs = 800, shouldFail = false, scenario = "default" } = options;

    await delay(delayMs);

    if (shouldFail) {
        throw new Error("Mock datasource load failed (simulated network error)");
    }

    if (scenario === "empty") {
        return getEmptyScenario();
    }

    if (scenario === "performance") {
        return getPerformanceScenario(500);
    }

    return getMultiSiteScenario();
}
