import { observer } from "mobx-react-lite";
import { ReactElement } from "react";

import { useGanttStore } from "../stores/StoreContext";

export const GanttErrorToast = observer((): ReactElement | null => {
    const ganttStore = useGanttStore();
    const message = ganttStore.uiMessage;

    if (!message) {
        return null;
    }

    return (
        <div className={`axgantt-toast axgantt-toast--${message.type}`} role="alert">
            <div className="axgantt-toast__content">
                {message.code && <span className="axgantt-toast__code">{message.code}</span>}
                <span>{message.text}</span>
            </div>
            <button type="button" className="axgantt-toast__close" onClick={() => ganttStore.clearUiMessage()}>
                ×
            </button>
        </div>
    );
});
