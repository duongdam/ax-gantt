import { ReactElement } from "react";

import { parseInlineStyle } from "@mendix/pluggable-widgets-tools";

import { AxGanttPreviewProps } from "../typings/AxGanttProps";

function parentInline(node?: HTMLElement | null): void {
    if (node && node.parentElement && node.parentElement.parentElement) {
        node.parentElement.parentElement.style.display = "block";
    }
}

export function preview(props: AxGanttPreviewProps): ReactElement {
    const mode = props.useMockData ? "Mock JSON" : "Expression JSON";
    const height = props.ganttHeight ?? 600;

    const headerParts: string[] = [];
    if (props.roadmapNo) {
        headerParts.push(`No: ${props.roadmapNo}`);
    }
    if (props.roadmapRevision) {
        headerParts.push(`Rev: ${props.roadmapRevision}`);
    }
    if (props.roadmapRevisedBy) {
        headerParts.push(`By: ${props.roadmapRevisedBy}`);
    }

    return (
        <div ref={parentInline} className={`axgantt-root ${props.class}`} style={parseInlineStyle(props.style)}>
            {headerParts.length > 0 && (
                <div className="axgantt-roadmap-header axgantt-preview__header-meta">{headerParts.join("  ·  ")}</div>
            )}
            <div className="dhl-gantt-preview">
                <div className="dhl-gantt-preview__header">Ax Gantt</div>
                <div className="dhl-gantt-preview__meta">
                    {mode} · {height}px
                    {props.readOnly ? " · Read only" : ""}
                    {!props.mayEdit ? " · Edit locked" : ""}
                </div>
                <div className="dhl-gantt-preview__layout" aria-hidden="true">
                    <span className="dhl-gantt-preview__tree">Project tree</span>
                    <span className="dhl-gantt-preview__timeline">2026 · W01–W53</span>
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
    return require("./ui/AxGantt.css");
}
