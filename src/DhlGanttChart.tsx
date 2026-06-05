import { ReactElement, useCallback } from "react";

import { DhlGanttChartContainerProps } from "../typings/DhlGanttChartProps";
import { BadgeSample } from "./components/BadgeSample";
import "./ui/DhlGanttChart.css";

export function DhlGanttChart(props: DhlGanttChartContainerProps): ReactElement {
    const { dhlganttchartType, dhlganttchartValue, valueAttribute, onClickAction, style, bootstrapStyle } = props;
    const onClickHandler = useCallback(() => {
        if (onClickAction && onClickAction.canExecute) {
            onClickAction.execute();
        }
    }, [onClickAction]);

    return (
        <BadgeSample
            type={dhlganttchartType}
            bootstrapStyle={bootstrapStyle}
            className={props.class}
            clickable={!!onClickAction}
            defaultValue={dhlganttchartValue ? dhlganttchartValue : ""}
            onClickAction={onClickHandler}
            style={style}
            value={valueAttribute ? valueAttribute.displayValue : ""} />
    );
}
