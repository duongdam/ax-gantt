import { Component, type ErrorInfo, type ReactElement, type ReactNode } from "react";

export interface WidgetErrorBoundaryProps {
    children: ReactNode;
    widgetName?: string;
}

interface WidgetErrorBoundaryState {
    error: Error | null;
}

export class WidgetErrorBoundary extends Component<WidgetErrorBoundaryProps, WidgetErrorBoundaryState> {
    state: WidgetErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error("[DhlGanttChart] Render error:", error, info.componentStack);
    }

    render(): ReactNode {
        if (this.state.error) {
            return (
                <div className="axgantt-fatal-error" role="alert">
                    <strong>{this.props.widgetName ?? "DHL Gantt Chart"} failed to render.</strong>
                    <p>{this.state.error.message}</p>
                    <p>Open the browser console (F12) for details.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export function withWidgetErrorBoundary(element: ReactElement, widgetName?: string): ReactElement {
    return <WidgetErrorBoundary widgetName={widgetName}>{element}</WidgetErrorBoundary>;
}
