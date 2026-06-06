import type { TaskListPayload } from "../store/types";

export interface AxGanttMockBundle {
    taskListJson: string;
    scaleJson: string;
    columnsJson: string;
    markerJson: string;
    roadmapNo: string;
    roadmapRevision: string;
    roadmapRevisedBy: string;
    roadmapRevisedAt: string;
}

/** Canonical 5-level PM roadmap tree (portfolio → program → phase → product → task). */
export const MOCK_TASK_LIST: TaskListPayload = {
    tasks: [
        {
            id: "PF-1",
            text: "Samsung DS PM Roadmap 2026",
            start: "2026-01-01",
            end: "2026-12-31",
            type: "project",
            open: true,
            level: "portfolio"
        },
        {
            id: "PRG-AL",
            text: "Advanced Logic",
            parent: "PF-1",
            start: "2026-01-01",
            end: "2026-12-31",
            type: "project",
            open: true,
            level: "program"
        },
        {
            id: "PH-AL-1",
            text: "Phase I · 2026",
            parent: "PRG-AL",
            start: "2026-01-05",
            end: "2026-08-16",
            type: "project",
            open: true,
            level: "phase"
        },
        {
            id: "PROD-ALPHA",
            text: "Product Alpha",
            parent: "PH-AL-1",
            start: "2026-02-02",
            end: "2026-05-18",
            type: "task",
            progress: 0.35,
            color: "#4F46E5",
            level: "product"
        },
        {
            id: "TSK-FREEZE",
            text: "Design freeze",
            parent: "PROD-ALPHA",
            start: "2026-02-23",
            end: "2026-02-23",
            type: "milestone",
            level: "task"
        },
        {
            id: "PROD-BETA",
            text: "Product Beta",
            parent: "PH-AL-1",
            start: "2026-04-28",
            end: "2026-08-16",
            type: "task",
            progress: 0.12,
            color: "#7C3AED",
            level: "product"
        },
        {
            id: "TSK-BETA-VAL",
            text: "Beta validation",
            parent: "PROD-BETA",
            start: "2026-07-06",
            end: "2026-07-06",
            type: "milestone",
            level: "task"
        },
        {
            id: "PH-AL-2",
            text: "Phase II · 2026",
            parent: "PRG-AL",
            start: "2026-07-06",
            end: "2026-12-31",
            type: "project",
            open: true,
            level: "phase"
        },
        {
            id: "PROD-GAMMA",
            text: "Product Gamma",
            parent: "PH-AL-2",
            start: "2026-07-06",
            end: "2026-11-09",
            type: "task",
            progress: 0.05,
            color: "#6366F1",
            level: "product"
        },
        {
            id: "TSK-GAMMA-GA",
            text: "Gamma GA",
            parent: "PROD-GAMMA",
            start: "2026-11-02",
            end: "2026-11-02",
            type: "milestone",
            level: "task"
        },
        {
            id: "PRG-MEM",
            text: "Memory Technology",
            parent: "PF-1",
            start: "2026-01-01",
            end: "2026-12-31",
            type: "project",
            open: true,
            level: "program"
        },
        {
            id: "PH-MEM-1",
            text: "Phase I · 2026",
            parent: "PRG-MEM",
            start: "2026-01-05",
            end: "2026-12-31",
            type: "project",
            open: true,
            level: "phase"
        },
        {
            id: "PROD-DRAM",
            text: "DRAM Gen-X",
            parent: "PH-MEM-1",
            start: "2026-03-09",
            end: "2026-10-05",
            type: "task",
            progress: 0.22,
            color: "#0891B2",
            level: "product"
        },
        {
            id: "TSK-RTL",
            text: "RTL complete",
            parent: "PROD-DRAM",
            start: "2026-04-13",
            end: "2026-04-13",
            type: "milestone",
            level: "task"
        },
        {
            id: "TSK-TAPEOUT",
            text: "Tape-out",
            parent: "PROD-DRAM",
            start: "2026-09-21",
            end: "2026-09-21",
            type: "milestone",
            level: "task"
        },
        {
            id: "TSK-YEAR-OPEN",
            text: "Year kickoff",
            parent: "PF-1",
            start: "2026-01-05",
            end: "2026-01-05",
            type: "milestone",
            level: "task"
        },
        {
            id: "TSK-YEAR-CLOSE",
            text: "Year close review",
            parent: "PF-1",
            start: "2026-12-28",
            end: "2026-12-28",
            type: "milestone",
            level: "task"
        }
    ],
    links: [
        { id: "LN-1", source: "TSK-FREEZE", target: "PROD-BETA", type: 0 },
        { id: "LN-2", source: "TSK-RTL", target: "TSK-TAPEOUT", type: 0 }
    ]
};

export const MOCK_SCALE_JSON = JSON.stringify({
    anchorYear: 2026,
    weekLabelFormat: "W##",
    scales: [
        { unit: "year", step: 1, format: "year" },
        { unit: "week", step: 1, format: "W##" }
    ]
});

export const MOCK_COLUMNS_JSON = JSON.stringify({
    columns: [{ name: "text", label: "Project", tree: true, width: 300, resize: true }]
});

export const MOCK_MARKER_JSON = JSON.stringify({
    markers: [
        {
            start_date: "2026-02-23",
            css: "axgantt-marker",
            text: "Design freeze",
            title: "Product Alpha — design freeze (W08)"
        },
        {
            start_date: "2026-09-21",
            css: "axgantt-marker",
            text: "Tape-out",
            title: "DRAM Gen-X — tape-out (W38)"
        },
        {
            start_date: "2026-12-28",
            css: "axgantt-marker",
            text: "Year close",
            title: "Portfolio year-end review (W53)"
        }
    ]
});

export const MOCK_HEADER = {
    roadmapNo: "Msoc251030-155",
    roadmapRevision: "3",
    roadmapRevisedBy: "mxadmin",
    roadmapRevisedAt: "2026-06-07T08:00:00"
} as const;

export const MOCK_LOAD_DELAY_MS = 600;

export function getAxGanttRoadmapMock(): AxGanttMockBundle {
    return {
        taskListJson: JSON.stringify(MOCK_TASK_LIST),
        scaleJson: MOCK_SCALE_JSON,
        columnsJson: MOCK_COLUMNS_JSON,
        markerJson: MOCK_MARKER_JSON,
        ...MOCK_HEADER
    };
}
