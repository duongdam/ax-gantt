/**
 * This file was generated from DhlGanttChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue, ListAttributeValue, ListValue } from "mendix";
import { Big } from "big.js";
import { CSSProperties } from "react";

export type ViewModeEnum = "project" | "resourceTimeline" | "hybrid";

export type TimeZoneModeEnum = "utc" | "browserLocal" | "fixed";

export type DateUnitEnum = "minute" | "hour" | "day";

export type DimensionKeyEnum = "site" | "sourceSystem" | "department" | "status" | "project" | "resource";

export interface DimensionConfigType {
    dimensionKey: DimensionKeyEnum;
    dimensionEnabled: boolean;
    dimensionGroupBy: boolean;
    dimensionShowInGrid: boolean;
    dimensionShowInFilterBar: boolean;
    dimensionLabel: string;
}

export type PrimaryGroupDimensionEnum = "none" | "site" | "project" | "sourceSystem" | "department";

export type CrossFilterModeEnum = "and" | "or";

export type FilterModeEnum = "client" | "server";

export type InitialScaleEnum = "hour" | "day" | "week" | "month" | "quarter" | "year";

export type TaskBarTemplateEnum = "default" | "compact";

export type MockScenarioEnum = "default" | "empty" | "performance";

export interface DimensionConfigPreviewType {
    dimensionKey: DimensionKeyEnum;
    dimensionEnabled: boolean;
    dimensionGroupBy: boolean;
    dimensionShowInGrid: boolean;
    dimensionShowInFilterBar: boolean;
    dimensionLabel: string;
}

export interface DhlGanttChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    viewMode: ViewModeEnum;
    readOnly: boolean;
    useMockData: boolean;
    timeZoneMode: TimeZoneModeEnum;
    fixedTimeZone: string;
    dateUnit: DateUnitEnum;
    emptyMessage: string;
    showTrialNotice: boolean;
    dimensionConfig: DimensionConfigType[];
    primaryGroupDimension: PrimaryGroupDimensionEnum;
    crossFilterMode: CrossFilterModeEnum;
    filterMode: FilterModeEnum;
    showDimensionFilterBar: boolean;
    onDimensionFilterChanged?: ActionValue;
    tasksDataSource?: ListValue;
    taskId?: ListAttributeValue<string | Big>;
    taskLabel?: ListAttributeValue<string>;
    taskStart?: ListAttributeValue<Date>;
    taskEnd?: ListAttributeValue<Date>;
    taskDuration?: ListAttributeValue<Big>;
    taskParentId?: ListAttributeValue<string | Big>;
    taskProgress?: ListAttributeValue<Big>;
    taskType?: ListAttributeValue<string>;
    taskOpen?: ListAttributeValue<boolean>;
    taskReadOnly?: ListAttributeValue<boolean>;
    taskColor?: ListAttributeValue<string>;
    taskSiteCode?: ListAttributeValue<string>;
    taskSourceSystem?: ListAttributeValue<string>;
    taskStatus?: ListAttributeValue<string>;
    taskVersion?: ListAttributeValue<string | Big>;
    taskModifiedAt?: ListAttributeValue<Date>;
    linksDataSource?: ListValue;
    linkId?: ListAttributeValue<string | Big>;
    linkSource?: ListAttributeValue<string>;
    linkTarget?: ListAttributeValue<string>;
    linkType?: ListAttributeValue<Big | string>;
    linkLag?: ListAttributeValue<Big>;
    resourcesDataSource?: ListValue;
    resourceId?: ListAttributeValue<string | Big>;
    resourceName?: ListAttributeValue<string>;
    resourceType?: ListAttributeValue<string>;
    resourceSiteCode?: ListAttributeValue<string>;
    resourceDepartment?: ListAttributeValue<string>;
    resourceCapacity?: ListAttributeValue<Big>;
    assignmentsDataSource?: ListValue;
    assignmentId?: ListAttributeValue<string | Big>;
    assignmentTaskId?: ListAttributeValue<string>;
    assignmentResourceId?: ListAttributeValue<string>;
    assignmentValue?: ListAttributeValue<Big>;
    assignmentStart?: ListAttributeValue<Date>;
    assignmentEnd?: ListAttributeValue<Date>;
    initialScale: InitialScaleEnum;
    initialScrollDate?: DynamicValue<Date>;
    showGrid: boolean;
    showChart: boolean;
    rowHeight: number;
    barHeight: number;
    fitOnLoad: boolean;
    highlightWeekends: boolean;
    workingTimeEnabled: boolean;
    showTodayMarker: boolean;
    enableTooltips: boolean;
    enableQuickInfo: boolean;
    enableSplitTasks: boolean;
    enableBaselines: boolean;
    showDeadlines: boolean;
    taskBarTemplate: TaskBarTemplateEnum;
    showToolbar: boolean;
    enableDragMove: boolean;
    enableResize: boolean;
    enableProgressDrag: boolean;
    snapToGrid: boolean;
    enableCreateTask: boolean;
    enableDeleteTask: boolean;
    enableHierarchyEdit: boolean;
    enableLightbox: boolean;
    enableInlineEdit: boolean;
    enableCopyPaste: boolean;
    enableContextMenu: boolean;
    enableLinkDraw: boolean;
    enableLinkDelete: boolean;
    enableMultiselect: boolean;
    enableKeyboard: boolean;
    selectedTaskId?: EditableValue<string>;
    selectedResourceId?: EditableValue<string>;
    autoScheduling: boolean;
    enableConstraints: boolean;
    showCriticalPath: boolean;
    showResourceHistogram: boolean;
    enableUndo: boolean;
    enableExport: boolean;
    enableDetailDialog: boolean;
    detailDialogTitle: string;
    detailDialogShowCustom: boolean;
    onTaskClick?: ActionValue;
    onTaskDblClick?: ActionValue;
    onTaskSelected?: ActionValue;
    onBeforeTaskChange?: ActionValue;
    onTaskChanged?: ActionValue;
    onTaskCreated?: ActionValue;
    onTaskDeleted?: ActionValue;
    onLinkCreated?: ActionValue;
    onLinkDeleted?: ActionValue;
    onLinkValidationFailed?: ActionValue;
    onResourceClick?: ActionValue;
    onScaleChanged?: ActionValue;
    onDataParseError?: ActionValue;
    filterSiteCodes?: DynamicValue<string>;
    filterSourceSystems?: DynamicValue<string>;
    filterDepartments?: DynamicValue<string>;
    filterStatuses?: DynamicValue<string>;
    filterDateFrom?: DynamicValue<Date>;
    filterDateTo?: DynamicValue<Date>;
    filterSearch?: DynamicValue<string>;
    licenseKey: string;
    advancedConfigJson: string;
    debugMode: boolean;
    refreshInterval: number;
    mockShouldFail: boolean;
    mockScenario: MockScenarioEnum;
}

export interface DhlGanttChartPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    viewMode: ViewModeEnum;
    readOnly: boolean;
    useMockData: boolean;
    timeZoneMode: TimeZoneModeEnum;
    fixedTimeZone: string;
    dateUnit: DateUnitEnum;
    emptyMessage: string;
    showTrialNotice: boolean;
    dimensionConfig: DimensionConfigPreviewType[];
    primaryGroupDimension: PrimaryGroupDimensionEnum;
    crossFilterMode: CrossFilterModeEnum;
    filterMode: FilterModeEnum;
    showDimensionFilterBar: boolean;
    onDimensionFilterChanged: {} | null;
    tasksDataSource: {} | { caption: string } | { type: string } | null;
    taskId: string;
    taskLabel: string;
    taskStart: string;
    taskEnd: string;
    taskDuration: string;
    taskParentId: string;
    taskProgress: string;
    taskType: string;
    taskOpen: string;
    taskReadOnly: string;
    taskColor: string;
    taskSiteCode: string;
    taskSourceSystem: string;
    taskStatus: string;
    taskVersion: string;
    taskModifiedAt: string;
    linksDataSource: {} | { caption: string } | { type: string } | null;
    linkId: string;
    linkSource: string;
    linkTarget: string;
    linkType: string;
    linkLag: string;
    resourcesDataSource: {} | { caption: string } | { type: string } | null;
    resourceId: string;
    resourceName: string;
    resourceType: string;
    resourceSiteCode: string;
    resourceDepartment: string;
    resourceCapacity: string;
    assignmentsDataSource: {} | { caption: string } | { type: string } | null;
    assignmentId: string;
    assignmentTaskId: string;
    assignmentResourceId: string;
    assignmentValue: string;
    assignmentStart: string;
    assignmentEnd: string;
    initialScale: InitialScaleEnum;
    initialScrollDate: string;
    showGrid: boolean;
    showChart: boolean;
    rowHeight: number | null;
    barHeight: number | null;
    fitOnLoad: boolean;
    highlightWeekends: boolean;
    workingTimeEnabled: boolean;
    showTodayMarker: boolean;
    enableTooltips: boolean;
    enableQuickInfo: boolean;
    enableSplitTasks: boolean;
    enableBaselines: boolean;
    showDeadlines: boolean;
    taskBarTemplate: TaskBarTemplateEnum;
    showToolbar: boolean;
    enableDragMove: boolean;
    enableResize: boolean;
    enableProgressDrag: boolean;
    snapToGrid: boolean;
    enableCreateTask: boolean;
    enableDeleteTask: boolean;
    enableHierarchyEdit: boolean;
    enableLightbox: boolean;
    enableInlineEdit: boolean;
    enableCopyPaste: boolean;
    enableContextMenu: boolean;
    enableLinkDraw: boolean;
    enableLinkDelete: boolean;
    enableMultiselect: boolean;
    enableKeyboard: boolean;
    selectedTaskId: string;
    selectedResourceId: string;
    autoScheduling: boolean;
    enableConstraints: boolean;
    showCriticalPath: boolean;
    showResourceHistogram: boolean;
    enableUndo: boolean;
    enableExport: boolean;
    enableDetailDialog: boolean;
    detailDialogTitle: string;
    detailDialogShowCustom: boolean;
    onTaskClick: {} | null;
    onTaskDblClick: {} | null;
    onTaskSelected: {} | null;
    onBeforeTaskChange: {} | null;
    onTaskChanged: {} | null;
    onTaskCreated: {} | null;
    onTaskDeleted: {} | null;
    onLinkCreated: {} | null;
    onLinkDeleted: {} | null;
    onLinkValidationFailed: {} | null;
    onResourceClick: {} | null;
    onScaleChanged: {} | null;
    onDataParseError: {} | null;
    filterSiteCodes: string;
    filterSourceSystems: string;
    filterDepartments: string;
    filterStatuses: string;
    filterDateFrom: string;
    filterDateTo: string;
    filterSearch: string;
    licenseKey: string;
    advancedConfigJson: string;
    debugMode: boolean;
    refreshInterval: number | null;
    mockShouldFail: boolean;
    mockScenario: MockScenarioEnum;
}
