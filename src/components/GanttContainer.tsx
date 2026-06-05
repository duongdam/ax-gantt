import { observer } from "mobx-react-lite";
import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MendixDatasourceProps } from "../adapters/mendixDatasourceTypes";
import { FeatureRegistry } from "../engine/FeatureRegistry";
import type { GanttEngine } from "../engine/GanttEngine";
import { createEventBridge, type EventBridge, type EventBridgeActions } from "../engine/eventBridge";
import type { ViewMode } from "../engine/viewLayouts";
import { useDatasourceSync } from "../hooks/useDatasourceSync";
import { useGanttLifecycle } from "../hooks/useGanttLifecycle";
import type { MockLoadOptions } from "../mock/datasources";
import { useDatasourceStore, useDimensionStore, useGanttStore } from "../store/StoreContext";
import { DetailDialog } from "./DetailDialog";
import { DimensionFilterBar } from "./DimensionFilterBar";
import { GanttEmptyState } from "./GanttEmptyState";
import { GanttErrorToast } from "./GanttErrorToast";
import { LoadingOverlay } from "./LoadingOverlay";
import { TrialNoticeBanner } from "./TrialNoticeBanner";

export interface GanttContainerProps extends EventBridgeActions {
    useMockData?: boolean;
    mockOptions?: MockLoadOptions;
    readOnly?: boolean;
    showToolbar?: boolean;
    showDimensionFilterBar?: boolean;
    enableDetailDialog?: boolean;
    showTrialNotice?: boolean;
    licenseKey?: string;
    viewMode?: ViewMode;
    rowHeight?: number;
    barHeight?: number;
    mendixDatasource?: MendixDatasourceProps;
    featureOptions?: ConstructorParameters<typeof FeatureRegistry>[0];
}

export const GanttContainer = observer(function GanttContainer({
    useMockData = false,
    mockOptions,
    readOnly = false,
    showToolbar: _showToolbar = true,
    showDimensionFilterBar = true,
    enableDetailDialog = true,
    showTrialNotice = true,
    licenseKey,
    viewMode = "project",
    rowHeight,
    barHeight,
    mendixDatasource,
    featureOptions,
    onTaskClickAction,
    onTaskDblClickAction,
    onTaskSelectedAction,
    onScaleChangedAction,
    onTaskChangedAction,
    onBeforeTaskChangeAction,
    onTaskCreatedAction,
    onTaskDeletedAction,
    onLinkCreatedAction,
    onLinkDeletedAction,
    onLinkValidationFailedAction,
    onResourceClickAction
}: GanttContainerProps): ReactElement {
    const datasource = useDatasourceStore();
    const ganttStore = useGanttStore();
    const dimension = useDimensionStore();
    const chartRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<GanttEngine | null>(null);
    const eventBridgeRef = useRef<EventBridge | null>(null);
    const [isOffline, setIsOffline] = useState(() =>
        typeof navigator !== "undefined" ? !navigator.onLine : false
    );
    const [trialDismissed, setTrialDismissed] = useState(false);

    useEffect(() => {
        const handleOnline = (): void => setIsOffline(false);
        const handleOffline = (): void => setIsOffline(true);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const features = useMemo(
        () =>
            new FeatureRegistry({
                readOnly,
                licenseKey,
                isOffline,
                ...featureOptions
            }),
        [readOnly, licenseKey, isOffline, featureOptions]
    );

    useDatasourceSync({ useMockData, mockOptions, ...(mendixDatasource ?? {}) });

    const sliceVersion = dimension.sliceVersion;
    const primaryGroupDimension = dimension.primaryGroupDimension;

    const isDataReady = !datasource.isLoading && !datasource.isError && datasource.hasData;
    const isFilteredEmpty =
        isDataReady && dimension.hasActiveFilters && dimension.getVisibleTaskCount(datasource.model) === 0;
    const isChartReady = isDataReady;

    const parseChart = useCallback(
        (engine: GanttEngine) => {
            if (!engine.isInitialized()) {
                return;
            }
            const sliced = dimension.getSlicedModel(datasource.model);
            engine.parse(sliced, { groupBy: primaryGroupDimension, viewMode });
        },
        [datasource.model, sliceVersion, primaryGroupDimension, dimension, viewMode]
    );

    const bridgeActions = useMemo<EventBridgeActions>(
        () => ({
            onTaskClickAction,
            onTaskDblClickAction,
            onTaskSelectedAction,
            onScaleChangedAction,
            onTaskChangedAction,
            onBeforeTaskChangeAction,
            onTaskCreatedAction,
            onTaskDeletedAction,
            onLinkCreatedAction,
            onLinkDeletedAction,
            onLinkValidationFailedAction,
            onResourceClickAction
        }),
        [
            onTaskClickAction,
            onTaskDblClickAction,
            onTaskSelectedAction,
            onScaleChangedAction,
            onTaskChangedAction,
            onBeforeTaskChangeAction,
            onTaskCreatedAction,
            onTaskDeletedAction,
            onLinkCreatedAction,
            onLinkDeletedAction,
            onLinkValidationFailedAction,
            onResourceClickAction
        ]
    );

    const attachBridge = useCallback(
        (engine: GanttEngine) => {
            if (eventBridgeRef.current) {
                eventBridgeRef.current.detach(engine.getGantt());
            }

            const bridge = createEventBridge();
            bridge.attach(engine.getGantt(), {
                datasource,
                ganttStore,
                features,
                engine,
                enableDetailDialog,
                ...bridgeActions
            });
            eventBridgeRef.current = bridge;
        },
        [datasource, ganttStore, features, enableDetailDialog, bridgeActions]
    );

    const handleEngineReady = useCallback(
        (engine: GanttEngine) => {
            engineRef.current = engine;
            parseChart(engine);
            attachBridge(engine);
        },
        [parseChart, attachBridge]
    );

    useGanttLifecycle({
        containerRef: chartRef,
        features,
        scale: ganttStore.view.scale,
        viewMode,
        licenseKey,
        rowHeight,
        barHeight,
        isReady: isChartReady,
        onEngineReady: handleEngineReady
    });

    useEffect(() => {
        if (engineRef.current) {
            parseChart(engineRef.current);
        }
    }, [parseChart]);

    useEffect(() => {
        const engine = engineRef.current;
        if (engine?.isInitialized() && engine.getViewMode() !== viewMode) {
            engine.setViewMode(viewMode, features, ganttStore.view.scale);
            parseChart(engine);
        }
    }, [viewMode, features, ganttStore.view.scale, parseChart]);

    useEffect(() => {
        if (engineRef.current?.isInitialized()) {
            attachBridge(engineRef.current);
        }
    }, [attachBridge]);

    useEffect(() => {
        return () => {
            const engine = engineRef.current;
            if (engine?.isInitialized() && eventBridgeRef.current) {
                eventBridgeRef.current.detach(engine.getGantt());
                eventBridgeRef.current = null;
            }
        };
    }, []);

    const showTrialBanner = showTrialNotice && !licenseKey?.trim() && !trialDismissed;

    return (
        <div className="dhl-gantt-container">
            <TrialNoticeBanner visible={showTrialBanner} onDismiss={() => setTrialDismissed(true)} />
            {isOffline && (
                <div className="dhl-gantt-offline-notice" role="status">
                    Offline mode — chart is read-only until connectivity is restored.
                </div>
            )}
            <LoadingOverlay visible={datasource.isLoading} />
            <GanttErrorToast />
            <DetailDialog />

            {/* GanttToolbar hidden — zoom/scale controls not needed for executive portfolio view yet
            {showToolbar && isChartReady && !isFilteredEmpty && (
                <GanttToolbar engine={engineRef.current} onScaleChanged={handleToolbarScaleChange} />
            )}
            */}

            {showDimensionFilterBar && isChartReady && (
                <DimensionFilterBar
                    onWeekSelected={week => {
                        ganttStore.setScrollDate(week.start);
                        engineRef.current?.scrollToDate(week.start);
                    }}
                />
            )}

            {datasource.isError && !datasource.isLoading && (
                <GanttEmptyState variant="error" message={datasource.error ?? undefined} />
            )}

            {!datasource.isError && !datasource.isLoading && !datasource.hasData && (
                <GanttEmptyState variant="empty" />
            )}

            {isFilteredEmpty && (
                <GanttEmptyState variant="filtered" onClearFilters={() => dimension.clearAllFilters()} />
            )}

            {isChartReady && (
                <div
                    ref={chartRef}
                    className={`dhl-gantt-chart${datasource.isLoading || isFilteredEmpty ? " dhl-gantt-chart--blocked" : ""}`}
                    aria-label="Gantt schedule chart"
                    aria-busy={datasource.isLoading}
                    hidden={isFilteredEmpty}
                />
            )}
        </div>
    );
});
