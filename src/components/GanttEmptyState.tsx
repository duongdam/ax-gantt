import { observer } from "mobx-react-lite";
import { ReactElement, useCallback } from "react";

import { useJsonDataStore } from "../store/StoreContext";

export type GanttEmptyStateVariant = "empty" | "error";

export interface GanttEmptyStateProps {
    variant: GanttEmptyStateVariant;
    message?: string;
    onRetry?: () => void;
}

const defaultMessages: Record<GanttEmptyStateVariant, string> = {
    empty: "No tasks to display.",
    error: "Failed to load schedule data."
};

export const GanttEmptyState = observer(({ variant, message, onRetry }: GanttEmptyStateProps): ReactElement => {
    const jsonData = useJsonDataStore();
    const className = variant === "error" ? "axgantt-error" : "axgantt-empty";
    const text = message ?? jsonData.parseError ?? defaultMessages[variant];

    const handleRetry = useCallback(() => {
        if (onRetry) {
            onRetry();
            return;
        }
        jsonData.clear();
    }, [onRetry, jsonData]);

    return (
        <div className={className} role={variant === "error" ? "alert" : "status"}>
            <p className="dhl-gantt-empty__message">{text}</p>
            {variant === "error" && (
                <button type="button" className="dhl-gantt-empty__retry" onClick={handleRetry}>
                    Retry
                </button>
            )}
        </div>
    );
});
