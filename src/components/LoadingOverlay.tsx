import { observer } from "mobx-react-lite";
import { ReactElement } from "react";

export interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export const LoadingOverlay = observer(
    ({ visible, message = "Loading schedule…" }: LoadingOverlayProps): ReactElement | null => {
        if (!visible) {
            return null;
        }

        return (
            <div className="axgantt-loading" role="status" aria-live="polite" aria-busy="true">
                <div className="axgantt-loading__spinner" aria-hidden="true" />
                <span className="axgantt-loading__message">{message}</span>
            </div>
        );
    }
);
