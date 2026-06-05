import { observer } from "mobx-react-lite";
import { ReactElement } from "react";

export interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export const LoadingOverlay = observer(function LoadingOverlay({
    visible,
    message = "Loading schedule…"
}: LoadingOverlayProps): ReactElement | null {
    if (!visible) {
        return null;
    }

    return (
        <div className="dhl-gantt-loading" role="status" aria-live="polite" aria-busy="true">
            <div className="dhl-gantt-loading__spinner" aria-hidden="true" />
            <span className="dhl-gantt-loading__message">{message}</span>
        </div>
    );
});
