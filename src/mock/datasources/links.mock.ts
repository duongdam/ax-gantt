import type { GanttLink } from "../../store/types";

export const MOCK_LINKS: GanttLink[] = [
    { id: "L-1", source: "PROD-S26", target: "PROD-ZFOLD", type: 0, lag: 0 },
    { id: "L-2", source: "PROD-CIVIC", target: "PROD-CRV", type: 0, lag: 0 },
    { id: "L-3", source: "PROD-BATT", target: "M-GATE", type: 0 },
    { id: "L-4", source: "PROD-LLM", target: "PROD-RAG", type: 0, lag: 0 },
    { id: "L-5", source: "PROD-WMS-CORE", target: "PROD-AGV", type: 0, lag: 0 },
    { id: "L-6", source: "PROD-ETCH", target: "M-FAB", type: 0 },
    { id: "L-7", source: "PROD-WING", target: "PROD-AVION", type: 0, lag: 0 },
    { id: "L-8", source: "PROD-OLED-14", target: "PROD-OLED-55", type: 0, lag: 0 }
];
