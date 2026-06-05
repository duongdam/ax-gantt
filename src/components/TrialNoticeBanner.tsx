import { ReactElement } from "react";

export interface TrialNoticeBannerProps {
    visible: boolean;
    onDismiss?: () => void;
}

export function TrialNoticeBanner({ visible, onDismiss }: TrialNoticeBannerProps): ReactElement | null {
    if (!visible) {
        return null;
    }

    return (
        <div className="dhl-gantt-trial-notice" role="status">
            <span>dhtmlx Gantt trial — set a commercial license key to remove the watermark and unlock PRO features.</span>
            {onDismiss && (
                <button type="button" className="dhl-gantt-trial-notice__dismiss" onClick={onDismiss}>
                    Dismiss
                </button>
            )}
        </div>
    );
}
