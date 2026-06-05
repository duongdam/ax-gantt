import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useMemo } from "react";

import {
    findWeekByTimeRange,
    getProjectSegmentsForWeek,
    getWeekBuckets,
    type WeekBucket
} from "../dimensions/weekTimeline";
import { useDatasourceStore, useDimensionStore } from "../store/StoreContext";

export interface DimensionFilterBarProps {
    onWeekSelected?: (week: WeekBucket) => void;
    onFilterChanged?: (resultTaskCount: number) => void;
}

function formatSegmentRange(start: Date, end: Date): string {
    return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export const DimensionFilterBar = observer(function DimensionFilterBar({
    onWeekSelected,
    onFilterChanged
}: DimensionFilterBarProps): ReactElement | null {
    const dimension = useDimensionStore();
    const datasource = useDatasourceStore();

    const weeks = useMemo(() => getWeekBuckets(datasource.model), [datasource.model]);
    const activeWeek = useMemo(
        () => findWeekByTimeRange(weeks, dimension.appliedTimeRange.from, dimension.appliedTimeRange.to),
        [weeks, dimension.appliedTimeRange.from, dimension.appliedTimeRange.to]
    );
    const projectSegments = useMemo(
        () => (activeWeek ? getProjectSegmentsForWeek(datasource.model, activeWeek) : []),
        [datasource.model, activeWeek]
    );
    const selectedProjectId = dimension.getSelectedProjectId();

    useEffect(() => {
        if (weeks.length === 0 || activeWeek) {
            return;
        }

        dimension.selectWeek(weeks[0].start, weeks[0].end);
        onWeekSelected?.(weeks[0]);
    }, [weeks, activeWeek, dimension, onWeekSelected]);

    if (weeks.length === 0) {
        return null;
    }

    const notifyFilterChanged = (): void => {
        onFilterChanged?.(dimension.getVisibleTaskCount(datasource.model));
    };

    const handleWeekSelect = (week: WeekBucket): void => {
        dimension.selectWeek(week.start, week.end);
        onWeekSelected?.(week);
        notifyFilterChanged();
    };

    const handleProjectSelect = (projectId: string | null): void => {
        dimension.selectProjectSegment(projectId);
        notifyFilterChanged();
    };

    return (
        <div className="dhl-gantt-filter-bar" role="toolbar" aria-label="Week timeline">
            <div className="dhl-gantt-filter-bar__weeks">
                {weeks.map(week => {
                    const isActive = activeWeek?.id === week.id;
                    return (
                        <button
                            key={week.id}
                            type="button"
                            className={`dhl-gantt-week-tab${isActive ? " dhl-gantt-week-tab--active" : ""}`}
                            onClick={() => handleWeekSelect(week)}
                            aria-pressed={isActive}
                        >
                            <span className="dhl-gantt-week-tab__label">{week.label}</span>
                            <span className="dhl-gantt-week-tab__range">{week.rangeLabel}</span>
                        </button>
                    );
                })}
            </div>

            {activeWeek && projectSegments.length > 0 && (
                <div className="dhl-gantt-filter-bar__projects">
                    <span className="dhl-gantt-filter-bar__projects-label">Products · {activeWeek.label}</span>
                    <div className="dhl-gantt-filter-bar__project-list">
                        <button
                            type="button"
                            className={`dhl-gantt-project-segment${selectedProjectId === null ? " dhl-gantt-project-segment--active" : ""}`}
                            onClick={() => handleProjectSelect(null)}
                        >
                            All
                        </button>
                        {projectSegments.map(segment => (
                            <button
                                key={segment.id}
                                type="button"
                                className={`dhl-gantt-project-segment${selectedProjectId === segment.id ? " dhl-gantt-project-segment--active" : ""}`}
                                onClick={() => handleProjectSelect(segment.id)}
                                title={formatSegmentRange(segment.start, segment.end)}
                            >
                                <span className="dhl-gantt-project-segment__label">{segment.label}</span>
                                <span className="dhl-gantt-project-segment__range">
                                    {formatSegmentRange(segment.start, segment.end)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
