import { useEffect, useRef, type RefObject } from "react";

import type { GanttEngineInitOptions } from "../engine/GanttEngine";
import { createGanttEngine, type GanttEngine } from "../engine/GanttEngine";
import type { FeatureRegistry } from "../engine/FeatureRegistry";

export interface UseGanttLifecycleOptions extends GanttEngineInitOptions {
    containerRef: RefObject<HTMLElement | null>;
    features: FeatureRegistry;
    isReady: boolean;
    onEngineReady?: (engine: GanttEngine) => void;
}

export function useGanttLifecycle({
    containerRef,
    features,
    scale = "week",
    viewMode = "project",
    licenseKey,
    rowHeight,
    barHeight,
    isReady,
    onEngineReady
}: UseGanttLifecycleOptions): RefObject<GanttEngine | null> {
    const engineRef = useRef<GanttEngine | null>(null);
    const onEngineReadyRef = useRef(onEngineReady);

    onEngineReadyRef.current = onEngineReady;

    useEffect(() => {
        if (!isReady || !containerRef.current) {
            return;
        }

        const engine = createGanttEngine();

        try {
            engine.init(containerRef.current, features, { scale, viewMode, licenseKey, rowHeight, barHeight });
            engineRef.current = engine;
            onEngineReadyRef.current?.(engine);
        } catch (error) {
            console.error("[DhlGanttChart] Failed to initialize Gantt engine:", error);
            engineRef.current = null;
        }

        return () => {
            engine.destroy();
            engineRef.current = null;
        };
    }, [isReady, containerRef, features, scale, viewMode, licenseKey, rowHeight, barHeight]);

    return engineRef;
}
