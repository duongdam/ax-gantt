import { observer } from "mobx-react-lite";
import { ReactElement } from "react";

import type { GanttEngine } from "../engine/GanttEngine";
import type { GanttScale } from "../store/types";
import { useGanttStore } from "../store/StoreContext";

const scales: GanttScale[] = ["hour", "day", "week", "month", "quarter", "year"];

export interface GanttToolbarProps {
    engine: GanttEngine | null;
    onScaleChanged?: (scale: GanttScale) => void;
}

export const GanttToolbar = observer(function GanttToolbar({
    engine,
    onScaleChanged
}: GanttToolbarProps): ReactElement {
    const ganttStore = useGanttStore();
    const currentScale = ganttStore.view.scale;

    const setScale = (scale: GanttScale): void => {
        engine?.setScale(scale);
        ganttStore.setScale(scale);
        onScaleChanged?.(scale);
    };

    const zoomIn = (): void => {
        if (!engine) {
            return;
        }
        const next = engine.zoomIn(currentScale);
        ganttStore.setScale(next);
        onScaleChanged?.(next);
    };

    const zoomOut = (): void => {
        if (!engine) {
            return;
        }
        const next = engine.zoomOut(currentScale);
        ganttStore.setScale(next);
        onScaleChanged?.(next);
    };

    return (
        <div className="dhl-gantt-toolbar" role="toolbar" aria-label="Gantt chart controls">
            <div className="dhl-gantt-toolbar__group">
                <button type="button" className="dhl-gantt-toolbar__btn" onClick={zoomOut} title="Zoom out">
                    −
                </button>
                <button type="button" className="dhl-gantt-toolbar__btn" onClick={zoomIn} title="Zoom in">
                    +
                </button>
            </div>

            <div className="dhl-gantt-toolbar__group">
                {scales.map(scale => (
                    <button
                        key={scale}
                        type="button"
                        className={`dhl-gantt-toolbar__btn${currentScale === scale ? " dhl-gantt-toolbar__btn--active" : ""}`}
                        onClick={() => setScale(scale)}
                    >
                        {scale}
                    </button>
                ))}
            </div>

            <div className="dhl-gantt-toolbar__group">
                <button type="button" className="dhl-gantt-toolbar__btn" onClick={() => engine?.fitTasks()}>
                    Fit
                </button>
                <button type="button" className="dhl-gantt-toolbar__btn" onClick={() => engine?.scrollToToday()}>
                    Today
                </button>
                <button type="button" className="dhl-gantt-toolbar__btn" onClick={() => engine?.toggleFullscreen()}>
                    Fullscreen
                </button>
            </div>
        </div>
    );
});
