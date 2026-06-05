import { ReactElement, useCallback, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";

import type { MendixDatasourceProps } from "./adapters/mendixDatasourceTypes";
import type { DimensionKey } from "./dimensions/dimensionTypes";
import { DhlGanttChartContainerProps } from "../typings/DhlGanttChartProps";
import { GanttContainer } from "./components/GanttContainer";
import { WidgetErrorBoundary } from "./components/WidgetErrorBoundary";
import type { FeatureRegistryOptions } from "./engine/FeatureRegistry";
import type { ViewMode } from "./engine/viewLayouts";
import type { MockLoadOptions } from "./mock/datasources";
import { createRootStore, StoreProvider, useDimensionStore, useGanttStore } from "./store/StoreContext";
import type { GanttScale } from "./store/types";
import "./ui/DhlGanttChart.css";

function mapPrimaryGroupDimension(value: DhlGanttChartContainerProps["primaryGroupDimension"]): DimensionKey | null {
    if (value === "none") {
        return null;
    }
    return value;
}

function mapViewMode(value: DhlGanttChartContainerProps["viewMode"]): ViewMode {
    return value;
}

const DhlGanttChartInner = observer(function DhlGanttChartInner(props: DhlGanttChartContainerProps): ReactElement {
    const ganttStore = useGanttStore();
    const dimension = useDimensionStore();

    const mockOptions = useMemo<MockLoadOptions>(
        () => ({
            delayMs: 600,
            shouldFail: props.mockShouldFail,
            scenario: props.mockScenario
        }),
        [props.mockShouldFail, props.mockScenario]
    );

    const mendixDatasourceProps = useMemo<MendixDatasourceProps>(
        () => ({
            tasksDataSource: props.tasksDataSource,
            taskId: props.taskId,
            taskLabel: props.taskLabel,
            taskStart: props.taskStart,
            taskEnd: props.taskEnd,
            taskDuration: props.taskDuration,
            taskParentId: props.taskParentId,
            taskProgress: props.taskProgress,
            taskType: props.taskType,
            taskOpen: props.taskOpen,
            taskReadOnly: props.taskReadOnly,
            taskColor: props.taskColor,
            taskSiteCode: props.taskSiteCode,
            taskSourceSystem: props.taskSourceSystem,
            taskStatus: props.taskStatus,
            taskVersion: props.taskVersion,
            taskModifiedAt: props.taskModifiedAt,
            linksDataSource: props.linksDataSource,
            linkId: props.linkId,
            linkSource: props.linkSource,
            linkTarget: props.linkTarget,
            linkType: props.linkType,
            linkLag: props.linkLag,
            resourcesDataSource: props.resourcesDataSource,
            resourceId: props.resourceId,
            resourceName: props.resourceName,
            resourceType: props.resourceType,
            resourceSiteCode: props.resourceSiteCode,
            resourceDepartment: props.resourceDepartment,
            resourceCapacity: props.resourceCapacity,
            assignmentsDataSource: props.assignmentsDataSource,
            assignmentId: props.assignmentId,
            assignmentTaskId: props.assignmentTaskId,
            assignmentResourceId: props.assignmentResourceId,
            assignmentValue: props.assignmentValue,
            assignmentStart: props.assignmentStart,
            assignmentEnd: props.assignmentEnd
        }),
        [
            props.tasksDataSource,
            props.taskId,
            props.taskLabel,
            props.taskStart,
            props.taskEnd,
            props.taskDuration,
            props.taskParentId,
            props.taskProgress,
            props.taskType,
            props.taskOpen,
            props.taskReadOnly,
            props.taskColor,
            props.taskSiteCode,
            props.taskSourceSystem,
            props.taskStatus,
            props.taskVersion,
            props.taskModifiedAt,
            props.linksDataSource,
            props.linkId,
            props.linkSource,
            props.linkTarget,
            props.linkType,
            props.linkLag,
            props.resourcesDataSource,
            props.resourceId,
            props.resourceName,
            props.resourceType,
            props.resourceSiteCode,
            props.resourceDepartment,
            props.resourceCapacity,
            props.assignmentsDataSource,
            props.assignmentId,
            props.assignmentTaskId,
            props.assignmentResourceId,
            props.assignmentValue,
            props.assignmentStart,
            props.assignmentEnd
        ]
    );

    const featureOptions = useMemo<FeatureRegistryOptions>(
        () => ({
            showGrid: props.showGrid,
            showChart: props.showChart,
            enableDragMove: props.enableDragMove,
            enableResize: props.enableResize,
            enableProgressDrag: props.enableProgressDrag,
            enableLinkDraw: props.enableLinkDraw,
            enableMultiselect: props.enableMultiselect,
            enableKeyboard: props.enableKeyboard,
            enableTooltips: props.enableTooltips,
            showTodayMarker: props.showTodayMarker,
            highlightWeekends: props.highlightWeekends,
            autoScheduling: props.autoScheduling,
            showCriticalPath: props.showCriticalPath,
            enableBaselines: props.enableBaselines,
            enableUndo: props.enableUndo,
            enableExport: props.enableExport,
            showResourceHistogram: props.showResourceHistogram
        }),
        [
            props.showGrid,
            props.showChart,
            props.enableDragMove,
            props.enableResize,
            props.enableProgressDrag,
            props.enableLinkDraw,
            props.enableMultiselect,
            props.enableKeyboard,
            props.enableTooltips,
            props.showTodayMarker,
            props.highlightWeekends,
            props.autoScheduling,
            props.showCriticalPath,
            props.enableBaselines,
            props.enableUndo,
            props.enableExport,
            props.showResourceHistogram
        ]
    );

    useEffect(() => {
        ganttStore.setScale(props.initialScale as GanttScale);
    }, [ganttStore, props.initialScale]);

    useEffect(() => {
        dimension.setCrossFilterMode(props.crossFilterMode);
        dimension.setPrimaryGroupDimension(mapPrimaryGroupDimension(props.primaryGroupDimension));
        dimension.setFilterMode(props.filterMode);
    }, [dimension, props.crossFilterMode, props.primaryGroupDimension, props.filterMode]);

    const executeAction = useCallback((action?: { canExecute?: boolean; execute?: () => void }) => {
        if (action?.canExecute) {
            action.execute?.();
        }
    }, []);

    const actionProps = {
        onTaskClickAction: useCallback(() => executeAction(props.onTaskClick), [executeAction, props.onTaskClick]),
        onTaskDblClickAction: useCallback(() => executeAction(props.onTaskDblClick), [executeAction, props.onTaskDblClick]),
        onTaskSelectedAction: useCallback(() => executeAction(props.onTaskSelected), [executeAction, props.onTaskSelected]),
        onScaleChangedAction: useCallback(() => executeAction(props.onScaleChanged), [executeAction, props.onScaleChanged]),
        onTaskCreatedAction: useCallback(() => executeAction(props.onTaskCreated), [executeAction, props.onTaskCreated]),
        onTaskDeletedAction: useCallback(() => executeAction(props.onTaskDeleted), [executeAction, props.onTaskDeleted]),
        onLinkCreatedAction: useCallback(() => executeAction(props.onLinkCreated), [executeAction, props.onLinkCreated]),
        onLinkDeletedAction: useCallback(() => executeAction(props.onLinkDeleted), [executeAction, props.onLinkDeleted]),
        onLinkValidationFailedAction: useCallback(
            () => executeAction(props.onLinkValidationFailed),
            [executeAction, props.onLinkValidationFailed]
        ),
        onResourceClickAction: useCallback(() => executeAction(props.onResourceClick), [executeAction, props.onResourceClick]),
        onTaskChangedAction: useCallback(() => {
            executeAction(props.onTaskChanged);
            return true;
        }, [executeAction, props.onTaskChanged]),
        onBeforeTaskChangeAction: useCallback(() => {
            executeAction(props.onBeforeTaskChange);
            return true;
        }, [executeAction, props.onBeforeTaskChange])
    };

    return (
        <div className={`dhl-gantt-root ${props.class}`} style={props.style} tabIndex={props.tabIndex}>
            <GanttContainer
                useMockData={props.useMockData}
                mockOptions={mockOptions}
                readOnly={props.readOnly}
                showToolbar={props.showToolbar}
                showDimensionFilterBar={props.showDimensionFilterBar}
                enableDetailDialog={props.enableDetailDialog}
                showTrialNotice={props.showTrialNotice}
                licenseKey={props.licenseKey}
                viewMode={mapViewMode(props.viewMode)}
                rowHeight={props.rowHeight}
                barHeight={props.barHeight}
                mendixDatasource={mendixDatasourceProps}
                featureOptions={featureOptions}
                {...actionProps}
            />
        </div>
    );
});

export function DhlGanttChart(props: DhlGanttChartContainerProps): ReactElement {
    const store = useMemo(() => createRootStore(), []);

    return (
        <WidgetErrorBoundary widgetName={props.name}>
            <StoreProvider store={store}>
                <DhlGanttChartInner {...props} />
            </StoreProvider>
        </WidgetErrorBoundary>
    );
}
