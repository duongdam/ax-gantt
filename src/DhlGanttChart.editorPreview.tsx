import { ReactElement } from "react";

import { parseInlineStyle } from "@mendix/pluggable-widgets-tools";

import { DhlGanttChartPreviewProps } from "../typings/DhlGanttChartProps";

function parentInline(node?: HTMLElement | null): void {
    if (node && node.parentElement && node.parentElement.parentElement) {
        node.parentElement.parentElement.style.display = "block";
    }
}

export function preview(props: DhlGanttChartPreviewProps): ReactElement {
    const mode = props.useMockData ? "Mock data" : "Mendix datasource";
    const scale = props.initialScale ?? "week";

    return (
        <div ref={parentInline} className={`dhl-gantt-root ${props.className}`} style={parseInlineStyle(props.style)}>
            <div className="dhl-gantt-preview">
                <div className="dhl-gantt-preview__header">DHL Gantt Chart</div>
                <div className="dhl-gantt-preview__meta">
                    {mode} · Scale: {scale}
                    {props.readOnly ? " · Read only" : ""}
                </div>
                <div className="dhl-gantt-preview__bars" aria-hidden="true">
                    <span className="dhl-gantt-preview__bar dhl-gantt-preview__bar--1" />
                    <span className="dhl-gantt-preview__bar dhl-gantt-preview__bar--2" />
                    <span className="dhl-gantt-preview__bar dhl-gantt-preview__bar--3" />
                </div>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/DhlGanttChart.css");
}
