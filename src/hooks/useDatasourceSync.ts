import { useEffect, useRef } from "react";

import { loadGanttModelFromMendix } from "../adapters/mendixDatasourceLoader";
import type { MendixDatasourceProps } from "../adapters/mendixDatasourceTypes";
import type { MockLoadOptions } from "../mock/datasources";
import { useDatasourceStore } from "../store/StoreContext";

export interface UseDatasourceSyncOptions extends MendixDatasourceProps {
    useMockData?: boolean;
    mockOptions?: MockLoadOptions;
}

export function useDatasourceSync({
    useMockData = false,
    mockOptions,
    ...mendixProps
}: UseDatasourceSyncOptions = {}): void {
    const datasource = useDatasourceStore();
    const mockOptionsRef = useRef(mockOptions);
    const mendixPropsRef = useRef(mendixProps);

    mockOptionsRef.current = mockOptions;
    mendixPropsRef.current = mendixProps;

    useEffect(() => {
        if (useMockData) {
            void datasource.load({ delayMs: 600, ...mockOptionsRef.current });
            return;
        }

        const result = loadGanttModelFromMendix(mendixPropsRef.current);

        if (result.isLoading) {
            datasource.setLoading(true);
            return;
        }

        if (result.error) {
            datasource.setError(result.error);
            datasource.setModel(result.model);
            return;
        }

        datasource.setModel(result.model);

        if (result.issues.length > 0 && mendixPropsRef.current.tasksDataSource) {
            const firstError = result.issues.find(issue => issue.code.startsWith("E") || issue.code.startsWith("L"));
            if (firstError) {
                console.warn("[DhlGanttChart] datasource parse issues:", result.issues);
            }
        }
    }, [
        useMockData,
        datasource,
        mockOptions?.shouldFail,
        mockOptions?.scenario,
        mockOptions?.delayMs,
        mendixProps.tasksDataSource?.status,
        mendixProps.tasksDataSource?.items,
        mendixProps.linksDataSource?.status,
        mendixProps.linksDataSource?.items,
        mendixProps.resourcesDataSource?.status,
        mendixProps.resourcesDataSource?.items,
        mendixProps.assignmentsDataSource?.status,
        mendixProps.assignmentsDataSource?.items
    ]);
}
