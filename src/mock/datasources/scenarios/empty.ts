import type { MockDatasourceBundle } from "../types";

export function getEmptyScenario(): MockDatasourceBundle {
    return {
        tasks: [],
        links: [],
        resources: [],
        assignments: []
    };
}
