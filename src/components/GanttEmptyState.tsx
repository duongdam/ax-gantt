import { observer } from "mobx-react-lite";
import { ReactElement, useCallback } from "react";

import { useDatasourceStore } from "../store/StoreContext";

export type GanttEmptyStateVariant = "empty" | "error" | "filtered";

export interface GanttEmptyStateProps {
    variant: GanttEmptyStateVariant;
    message?: string;
    /** Optional override; defaults to `DatasourceStore.retryLoad()` on error. */
    onRetry?: () => void;
    onClearFilters?: () => void;
}

const defaultMessages: Record<GanttEmptyStateVariant, string> = {
    empty: "No tasks to display.",
    error: "Failed to load schedule data.",
    filtered: "No tasks match the current filters."
};

export const GanttEmptyState = observer(function GanttEmptyState({
    variant,
    message,
    onRetry,
    onClearFilters
}: GanttEmptyStateProps): ReactElement {
    const datasource = useDatasourceStore();
    const className = variant === "error" ? "dhl-gantt-error" : "dhl-gantt-empty";
    const text = message ?? defaultMessages[variant];

    const handleRetry = useCallback(() => {
        if (onRetry) {
            onRetry();
            return;
        }
        void datasource.retryLoad();
    }, [onRetry, datasource]);

    return (
        <div className={className} role={variant === "error" ? "alert" : "status"}>
            <p className="dhl-gantt-empty__message">{text}</p>
            {variant === "error" && (
                <button type="button" className="dhl-gantt-empty__retry" onClick={handleRetry}>
                    Retry
                </button>
            )}
            {variant === "filtered" && onClearFilters && (
                <button type="button" className="dhl-gantt-empty__retry" onClick={onClearFilters}>
                    Clear filters
                </button>
            )}
        </div>
    );
});
