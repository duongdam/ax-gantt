import { ReactElement } from "react";

import { parseInlineStyle } from "@mendix/pluggable-widgets-tools";

import { BadgeSample, BadgeSampleProps } from "./components/BadgeSample";
import { DhlGanttChartPreviewProps } from "../typings/DhlGanttChartProps";

function parentInline(node?: HTMLElement | null): void {
    // Temporary fix, the web modeler add a containing div, to render inline we need to change it.
    if (node && node.parentElement && node.parentElement.parentElement) {
        node.parentElement.parentElement.style.display = "inline-block";
    }
}

function transformProps(props: DhlGanttChartPreviewProps): BadgeSampleProps {
    return {
        type: props.dhlganttchartType,
        bootstrapStyle: props.bootstrapStyle,
        className: props.className,
        clickable: false,
        style: parseInlineStyle(props.style),
        defaultValue: props.dhlganttchartValue ? props.dhlganttchartValue : "",
        value: props.valueAttribute
    };
}

export function preview(props: DhlGanttChartPreviewProps): ReactElement {
    return (
        <div ref={parentInline}>
            <BadgeSample {...transformProps(props)}></BadgeSample>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/DhlGanttChart.css");
}
