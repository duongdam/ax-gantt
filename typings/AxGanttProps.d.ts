/**
 * This file was generated from AxGantt.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue } from "mendix";
import { CSSProperties } from "react";

export interface AxGanttContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    class: string;
    style: string;
    tabIndex: number;
    useMockData: boolean;
    roadmapNo?: DynamicValue<string>;
    roadmapRevision?: DynamicValue<string>;
    roadmapRevisedBy?: DynamicValue<string>;
    roadmapRevisedAt?: DynamicValue<Date>;
    taskListJson?: DynamicValue<string>;
    scaleJson?: DynamicValue<string>;
    columnsJson?: DynamicValue<string>;
    markerJson?: DynamicValue<string>;
    ganttStartDate?: DynamicValue<Date>;
    ganttEndDate?: DynamicValue<Date>;
    initialScroll?: DynamicValue<Date>;
    ganttWidth?: number;
    ganttHeight?: number;
    defaultExpandTree: boolean;
    showAddTaskButton: boolean;
    enableMarker: boolean;
    autoFit: boolean;
    autoScroll: boolean;
    fitTasks: boolean;
    readOnly: boolean;
    mayEdit: boolean;
    dragMove: boolean;
    dragProgress: boolean;
    dragMultiple: boolean;
    dragResize: boolean;
    gridResize: boolean;
    resizeRows: boolean;
    sort: boolean;
    clickDrag: boolean;
    onTaskCreate?: ActionValue;
    onTaskResize?: ActionValue;
    onTaskMove?: ActionValue;
    onTaskDbClick?: ActionValue;
    onTaskCheck?: ActionValue;
    onTaskUndo?: ActionValue;
    onTaskSelect?: ActionValue;
    onTaskRowDrag?: ActionValue;
}

export interface AxGanttPreviewProps {
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
    class: string;
    style: string;
    tabIndex: number | null;
    useMockData: boolean;
    roadmapNo: string;
    roadmapRevision: string;
    roadmapRevisedBy: string;
    roadmapRevisedAt: string;
    taskListJson: string;
    scaleJson: string;
    columnsJson: string;
    markerJson: string;
    ganttStartDate: string;
    ganttEndDate: string;
    initialScroll: string;
    ganttWidth: number | null;
    ganttHeight: number | null;
    defaultExpandTree: boolean;
    showAddTaskButton: boolean;
    enableMarker: boolean;
    autoFit: boolean;
    autoScroll: boolean;
    fitTasks: boolean;
    readOnly: boolean;
    mayEdit: boolean;
    dragMove: boolean;
    dragProgress: boolean;
    dragMultiple: boolean;
    dragResize: boolean;
    gridResize: boolean;
    resizeRows: boolean;
    sort: boolean;
    clickDrag: boolean;
    onTaskCreate: {} | null;
    onTaskResize: {} | null;
    onTaskMove: {} | null;
    onTaskDbClick: {} | null;
    onTaskCheck: {} | null;
    onTaskUndo: {} | null;
    onTaskSelect: {} | null;
    onTaskRowDrag: {} | null;
}
