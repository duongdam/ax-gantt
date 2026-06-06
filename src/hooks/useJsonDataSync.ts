import { useEffect } from "react";

import { getAxGanttRoadmapMock, MOCK_LOAD_DELAY_MS } from "../mock/axgantt-roadmap.mock";
import type { JsonDataInput } from "../store/JsonDataStore";
import { useJsonDataStore } from "../store/StoreContext";

export interface UseJsonDataSyncOptions extends JsonDataInput {
    useMockData?: boolean;
    mockDelayMs?: number;
    enabled?: boolean;
}

export function useJsonDataSync({
    useMockData = false,
    mockDelayMs = MOCK_LOAD_DELAY_MS,
    enabled = true,
    taskListJson,
    scaleJson,
    columnsJson,
    markerJson
}: UseJsonDataSyncOptions): void {
    const jsonData = useJsonDataStore();

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let cancelled = false;

        if (useMockData) {
            jsonData.setLoading(true);
            const timer = window.setTimeout(() => {
                if (cancelled) {
                    return;
                }
                const mock = getAxGanttRoadmapMock();
                jsonData.loadFromJson({
                    taskListJson: mock.taskListJson,
                    scaleJson: mock.scaleJson,
                    columnsJson: mock.columnsJson,
                    markerJson: mock.markerJson
                });
            }, mockDelayMs);

            return () => {
                cancelled = true;
                window.clearTimeout(timer);
            };
        }

        jsonData.setLoading(true);
        jsonData.loadFromJson({ taskListJson, scaleJson, columnsJson, markerJson });

        return undefined;
    }, [enabled, useMockData, mockDelayMs, taskListJson, markerJson, jsonData]);

    useEffect(() => {
        if (!enabled || useMockData) {
            return;
        }

        if (!jsonData.hasData) {
            return;
        }

        jsonData.reloadLayout({ scaleJson, columnsJson, markerJson });
    }, [enabled, useMockData, scaleJson, columnsJson, markerJson, jsonData]);
}
