import { observer } from "mobx-react-lite";
import { type CSSProperties, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AxGanttInteractionConfig, JsonGanttConfig } from "../engine/configBuilder";
import { FeatureRegistry } from "../engine/FeatureRegistry";
import type { GanttEngine } from "../engine/GanttEngine";
import { createEventBridge, type EventBridge, type EventBridgeActions } from "../engine/eventBridge";
import { useJsonDataSync } from "../hooks/useJsonDataSync";
import { useGanttLifecycle } from "../hooks/useGanttLifecycle";
import { useGanttStore, useJsonDataStore } from "../stores/StoreContext";
import { GanttEmptyState } from "./GanttEmptyState";
import { GanttErrorToast } from "./GanttErrorToast";
import { LoadingOverlay } from "./LoadingOverlay";

export interface GanttContainerProps extends EventBridgeActions {
    useMockData?: boolean;
    readOnly?: boolean;
    ganttWidth?: number;
    ganttHeight?: number;
    defaultExpandTree?: boolean;
    enableMarker?: boolean;
    autoFit?: boolean;
    autoScroll?: boolean;
    fitTasks?: boolean;
    initialScroll?: Date;
    taskListJson?: string | null;
    scaleJson?: string | null;
    columnsJson?: string | null;
    markerJson?: string | null;
    ganttStartDate?: Date;
    ganttEndDate?: Date;
    featureOptions?: ConstructorParameters<typeof FeatureRegistry>[0];
    interactionOptions?: AxGanttInteractionConfig;
}

export const GanttContainer = observer(
    ({
        useMockData = false,
        readOnly = false,
        ganttWidth,
        ganttHeight = 600,
        defaultExpandTree = true,
        enableMarker = false,
        autoFit = false,
        autoScroll = true,
        fitTasks = false,
        initialScroll,
        taskListJson,
        scaleJson,
        columnsJson,
        markerJson,
        ganttStartDate,
        ganttEndDate,
        featureOptions,
        interactionOptions,
        onTaskDbClickAction,
        onTaskMoveAction,
        onTaskResizeAction,
        onTaskCreateAction,
        onTaskSelectAction,
        onTaskRowDragAction,
        onTaskCheckAction,
        onTaskUndoAction
    }: GanttContainerProps): ReactElement => {
        const jsonData = useJsonDataStore();
        const ganttStore = useGanttStore();
        const chartRef = useRef<HTMLDivElement>(null);
        const engineRef = useRef<GanttEngine | null>(null);
        const eventBridgeRef = useRef<EventBridge | null>(null);
        const [isOffline, setIsOffline] = useState(() =>
            typeof navigator !== "undefined" ? !navigator.onLine : false
        );
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
                    isOffline,
                    ...featureOptions
                }),
            [readOnly, isOffline, featureOptions]
        );

        useJsonDataSync({
            useMockData,
            taskListJson,
            scaleJson,
            columnsJson,
            markerJson: enableMarker ? markerJson : null
        });

        const jsonGanttConfig = useMemo<JsonGanttConfig>(
            () => ({
                scale: jsonData.scale,
                columns: jsonData.columns,
                markers: jsonData.markers,
                ganttStartDate,
                ganttEndDate,
                defaultExpandTree,
                interaction: {
                    ...interactionOptions,
                    enableMarkers: enableMarker
                }
            }),
            [
                jsonData.scale,
                jsonData.columns,
                jsonData.markers,
                ganttStartDate,
                ganttEndDate,
                defaultExpandTree,
                enableMarker,
                interactionOptions
            ]
        );

        const isDataReady = !jsonData.isLoading && !jsonData.isError && jsonData.hasData;
        const isChartReady = isDataReady;

        const parseChart = useCallback(
            (engine: GanttEngine) => {
                if (!engine.isInitialized()) {
                    return;
                }
                engine.applyJsonConfig(features, jsonGanttConfig);
                engine.parseAxGanttModel(jsonData.model, { defaultExpandTree, json: jsonGanttConfig });
            },
            [jsonData.model, jsonGanttConfig, defaultExpandTree, features]
        );

        const bridgeActions = useMemo<EventBridgeActions>(
            () => ({
                onTaskDbClickAction,
                onTaskMoveAction,
                onTaskResizeAction,
                onTaskCreateAction,
                onTaskSelectAction,
                onTaskRowDragAction,
                onTaskCheckAction,
                onTaskUndoAction
            }),
            [
                onTaskDbClickAction,
                onTaskMoveAction,
                onTaskResizeAction,
                onTaskCreateAction,
                onTaskSelectAction,
                onTaskRowDragAction,
                onTaskCheckAction,
                onTaskUndoAction
            ]
        );

        const attachBridge = useCallback(
            (engine: GanttEngine) => {
                if (eventBridgeRef.current) {
                    eventBridgeRef.current.detach(engine.getGantt());
                }

                const bridge = createEventBridge();
                bridge.attach(engine.getGantt(), {
                    jsonData,
                    ganttStore,
                    features,
                    engine,
                    ...bridgeActions
                });
                eventBridgeRef.current = bridge;
            },
            [jsonData, ganttStore, features, bridgeActions]
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
            viewMode: "project",
            json: jsonGanttConfig,
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
            if (!engine?.isInitialized()) {
                return;
            }
            if ((autoFit || fitTasks) && !(ganttStartDate && ganttEndDate)) {
                engine.fitTasks();
            }
            if (initialScroll) {
                engine.scrollToDate(initialScroll);
            } else if (autoScroll) {
                engine.scrollToToday();
            }
        }, [autoFit, fitTasks, initialScroll, autoScroll, isChartReady]);

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

        const errorMessage = jsonData.parseError ?? undefined;
        const chartStyle = useMemo(() => {
            const style: CSSProperties = { height: ganttHeight };
            if (ganttWidth && ganttWidth > 0) {
                style.width = ganttWidth;
            }
            return style;
        }, [ganttHeight, ganttWidth]);

        return (
            <div className="axgantt-container">
                {isOffline && (
                    <div className="axgantt-offline-notice" role="status">
                        Offline mode — chart is read-only until connectivity is restored.
                    </div>
                )}
                <LoadingOverlay visible={jsonData.isLoading} />
                <GanttErrorToast />

                {jsonData.isError && !jsonData.isLoading && <GanttEmptyState variant="error" message={errorMessage} />}

                {!jsonData.isError && !jsonData.isLoading && !jsonData.hasData && (
                    <GanttEmptyState variant="empty" message={errorMessage} />
                )}

                {isChartReady && (
                    <div
                        ref={chartRef}
                        className={`axgantt-chart${jsonData.isLoading ? " axgantt-chart--blocked" : ""}`}
                        style={chartStyle}
                        aria-label="PM Roadmap Gantt chart"
                        aria-busy={jsonData.isLoading}
                    />
                )}
            </div>
        );
    }
);
