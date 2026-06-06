import { observer } from "mobx-react-lite";
import { ReactElement } from "react";

import { useGanttStore } from "../store/StoreContext";

export const GanttErrorToast = observer((): ReactElement | null => {
    const ganttStore = useGanttStore();
    const message = ganttStore.uiMessage;

    if (!message) {
        return null;
    }

    return (
        <div className={`dhl-gantt-toast dhl-gantt-toast--${message.type}`} role="alert">
            <div className="dhl-gantt-toast__content">
                {message.code && <span className="dhl-gantt-toast__code">{message.code}</span>}
                <span>{message.text}</span>
            </div>
            <button type="button" className="dhl-gantt-toast__close" onClick={() => ganttStore.clearUiMessage()}>
                ×
            </button>
        </div>
    );
});
