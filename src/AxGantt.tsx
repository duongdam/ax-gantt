import { ActionValue } from "mendix";
import { type CSSProperties, ReactElement, useCallback, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { ConfigProvider } from "antd";
import { useAtlasTheme } from "./hooks/useAtlasTheme";

import { GanttContainer } from "./components/GanttContainer";
import { PmRoadmapHeader } from "./components/PmRoadmapHeader";
import { WidgetErrorBoundary } from "./components/WidgetErrorBoundary";
import type { AxGanttInteractionConfig } from "./engine/configBuilder";
import type { FeatureRegistryOptions } from "./engine/FeatureRegistry";
import { getAxGanttRoadmapMock } from "./mock/axgantt-roadmap.mock";
import { createRootStore, StoreProvider } from "./stores/StoreContext";
import { readDynamicDate, readDynamicString } from "./types/axganttRuntime";
import { AxGanttContainerProps } from "../typings/AxGanttProps";
import "./ui/AxGantt.css";

const AxGanttInner = observer((props: AxGanttContainerProps): ReactElement => {
    const taskListJson = readDynamicString(props.taskListJson);
    const scaleJson = readDynamicString(props.scaleJson);
    const columnsJson = readDynamicString(props.columnsJson);
    const markerJson = readDynamicString(props.markerJson);
    const mockBundle = useMemo(
        () => (props.useMockData ? getAxGanttRoadmapMock() : null),
        [props.useMockData]
    );

    const ganttStartDate =
        readDynamicDate(props.ganttStartDate) ??
        (mockBundle ? new Date(mockBundle.ganttStartDate) : undefined);
    const ganttEndDate =
        readDynamicDate(props.ganttEndDate) ??
        (mockBundle ? new Date(mockBundle.ganttEndDate) : undefined);
    const initialScroll = readDynamicDate(props.initialScroll);

    const effectiveReadOnly = props.readOnly || !props.mayEdit;

    const headerProps = useMemo(() => {
        return {
            roadmapNo: readDynamicString(props.roadmapNo) ?? mockBundle?.roadmapNo,
            roadmapRevision: readDynamicString(props.roadmapRevision) ?? mockBundle?.roadmapRevision,
            roadmapRevisedBy: readDynamicString(props.roadmapRevisedBy) ?? mockBundle?.roadmapRevisedBy,
            roadmapRevisedAt:
                readDynamicDate(props.roadmapRevisedAt) ??
                (mockBundle?.roadmapRevisedAt ? new Date(mockBundle.roadmapRevisedAt) : undefined)
        };
    }, [mockBundle, props.roadmapNo, props.roadmapRevision, props.roadmapRevisedBy, props.roadmapRevisedAt]);

    const featureOptions = useMemo<FeatureRegistryOptions>(
        () => ({
            readOnly: effectiveReadOnly,
            enableDragMove: !effectiveReadOnly && props.dragMove,
            enableResize: !effectiveReadOnly && props.dragResize,
            enableProgressDrag: !effectiveReadOnly && props.dragProgress,
            enableMultiselect: !effectiveReadOnly && props.dragMultiple,
            showGrid: true,
            showChart: true,
            enableLinkDraw: false,
            enableKeyboard: !effectiveReadOnly,
            enableTooltips: true,
            showTodayMarker: false,
            highlightWeekends: false
        }),
        [effectiveReadOnly, props.dragMove, props.dragResize, props.dragProgress, props.dragMultiple]
    );

    const interactionOptions = useMemo<AxGanttInteractionConfig>(
        () => ({
            gridResize: props.gridResize,
            resizeRows: props.resizeRows,
            sort: props.sort,
            clickDrag: !effectiveReadOnly && props.clickDrag,
            showAddTaskButton: !effectiveReadOnly && props.showAddTaskButton
        }),
        [effectiveReadOnly, props.gridResize, props.resizeRows, props.sort, props.clickDrag, props.showAddTaskButton]
    );

    const executeAction = useCallback((action?: ActionValue) => {
        if (action?.canExecute) {
            action.execute?.();
        }
    }, []);

    const executeActionWithResult = useCallback(async (action?: ActionValue): Promise<boolean> => {
        if (!action?.canExecute) {
            return true;
        }
        try {
            action.execute?.();
            return true;
        } catch {
            return false;
        }
    }, []);

    const actionProps = {
        onTaskDbClickAction: useCallback(
            () => executeAction(props.onTaskDbClick),
            [executeAction, props.onTaskDbClick]
        ),
        onTaskSelectAction: useCallback(() => executeAction(props.onTaskSelect), [executeAction, props.onTaskSelect]),
        onTaskCreateAction: useCallback(() => executeAction(props.onTaskCreate), [executeAction, props.onTaskCreate]),
        onTaskRowDragAction: useCallback(
            () => executeActionWithResult(props.onTaskRowDrag),
            [executeActionWithResult, props.onTaskRowDrag]
        ),
        onTaskCheckAction: useCallback(() => executeAction(props.onTaskCheck), [executeAction, props.onTaskCheck]),
        onTaskUndoAction: useCallback(() => executeAction(props.onTaskUndo), [executeAction, props.onTaskUndo]),
        onTaskMoveAction: useCallback(
            () => executeActionWithResult(props.onTaskMove),
            [executeActionWithResult, props.onTaskMove]
        ),
        onTaskResizeAction: useCallback(
            () => executeActionWithResult(props.onTaskResize),
            [executeActionWithResult, props.onTaskResize]
        )
    };

    const rootStyle = useMemo(() => {
        const layout: CSSProperties = { ...(props.style ?? {}) };
        if (props.ganttWidth > 0) {
            layout.width = props.ganttWidth;
        }
        if (props.ganttHeight > 0) {
            layout.minHeight = props.ganttHeight;
        }
        return layout;
    }, [props.style, props.ganttWidth, props.ganttHeight]);

    return (
        <div className={`axgantt-root ${props.class}`} style={rootStyle} tabIndex={props.tabIndex}>
            <PmRoadmapHeader {...headerProps} />
            <GanttContainer
                useMockData={props.useMockData}
                readOnly={effectiveReadOnly}
                ganttHeight={props.ganttHeight}
                ganttWidth={props.ganttWidth}
                defaultExpandTree={props.defaultExpandTree}
                enableMarker={props.enableMarker}
                autoFit={props.autoFit}
                autoScroll={props.autoScroll}
                fitTasks={props.fitTasks}
                initialScroll={initialScroll}
                taskListJson={taskListJson}
                scaleJson={scaleJson}
                columnsJson={columnsJson}
                markerJson={markerJson}
                ganttStartDate={ganttStartDate}
                ganttEndDate={ganttEndDate}
                featureOptions={featureOptions}
                interactionOptions={interactionOptions}
                {...actionProps}
            />
        </div>
    );
});

export function AxGantt(props: AxGanttContainerProps): ReactElement {
    const store = useMemo(() => createRootStore(), []);
    const atlasTheme = useAtlasTheme();

    return (
        <WidgetErrorBoundary widgetName={props.name}>
            <ConfigProvider theme={atlasTheme}>
                <StoreProvider store={store}>
                    <AxGanttInner {...props} />
                </StoreProvider>
            </ConfigProvider>
        </WidgetErrorBoundary>
    );
}
