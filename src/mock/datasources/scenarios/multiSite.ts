import { MOCK_ASSIGNMENTS } from "../assignments.mock";
import { MOCK_LINKS } from "../links.mock";
import { MOCK_RESOURCES } from "../resources.mock";
import { MOCK_TASKS } from "../tasks.mock";
import type { MockDatasourceBundle } from "../types";

/** Executive portfolio scenario for board-level overview. */
export function getMultiSiteScenario(): MockDatasourceBundle {
    return {
        tasks: MOCK_TASKS,
        links: MOCK_LINKS,
        resources: MOCK_RESOURCES,
        assignments: MOCK_ASSIGNMENTS
    };
}
