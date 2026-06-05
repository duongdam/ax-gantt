import { observer } from "mobx-react-lite";
import { ReactElement, useCallback, useEffect } from "react";

import { useDatasourceStore } from "../store/StoreContext";

function formatFieldLabel(key: string): string {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, char => char.toUpperCase())
        .trim();
}

function formatFieldValue(value: unknown): string {
    if (value === null || value === undefined) {
        return "—";
    }
    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }
    if (typeof value === "number") {
        return Number.isFinite(value) ? String(value) : "—";
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === "object") {
        return JSON.stringify(value);
    }
    return String(value);
}

export const DetailDialog = observer(function DetailDialog(): ReactElement | null {
    const datasource = useDatasourceStore();
    const { open, item } = datasource.dialog;

    const close = useCallback(() => {
        datasource.closeDetailDialog();
    }, [datasource]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                close();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, close]);

    if (!open || !item) {
        return null;
    }

    const fields = Object.entries(item.raw).filter(([, value]) => value !== undefined);

    return (
        <div className="dhl-gantt-dialog-backdrop" role="presentation" onClick={close}>
            <div
                className="dhl-gantt-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="dhl-gantt-dialog-title"
                onClick={event => event.stopPropagation()}
            >
                <header className="dhl-gantt-dialog__header">
                    <h2 id="dhl-gantt-dialog-title" className="dhl-gantt-dialog__title">
                        {item.label}
                    </h2>
                    <span className="dhl-gantt-dialog__meta">
                        {item.entityType} · {item.id}
                    </span>
                </header>

                <div className="dhl-gantt-dialog__body">
                    <table className="dhl-gantt-dialog__table">
                        <thead>
                            <tr>
                                <th scope="col">Field</th>
                                <th scope="col">Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map(([key, value]) => (
                                <tr key={key}>
                                    <th scope="row">{formatFieldLabel(key)}</th>
                                    <td>{formatFieldValue(value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <footer className="dhl-gantt-dialog__footer">
                    <button type="button" className="dhl-gantt-dialog__close" onClick={close}>
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
});
