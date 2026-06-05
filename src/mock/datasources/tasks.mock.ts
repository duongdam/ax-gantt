import {
    EXECUTIVE_TIMELINE_ANCHOR_YEAR,
    formatExecutivePeriodRange
} from "../../engine/executiveTimeline";
import type { GanttTask } from "../../store/types";

const Y = EXECUTIVE_TIMELINE_ANCHOR_YEAR;

function d(month: number, day: number): Date {
    return new Date(`${Y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T08:00:00`);
}

function span(start: Date, end: Date): { start: Date; end: Date; periodLabel: string } {
    return {
        start,
        end,
        periodLabel: formatExecutivePeriodRange(start, end)
    };
}

interface ProductDef {
    id: string;
    text: string;
    from: [number, number];
    to: [number, number];
    progress: number;
    color: string;
    status: "planned" | "in_progress" | "completed";
    owner: string;
}

interface ProgramDef {
    id: string;
    text: string;
    from: [number, number];
    to: [number, number];
    progress: number;
    color: string;
    status: "planned" | "in_progress" | "completed";
    products: ProductDef[];
}

interface CompanyDef {
    id: string;
    text: string;
    color: string;
    siteCode: string;
    progress: number;
    status: "planned" | "in_progress" | "completed";
    programs: ProgramDef[];
}

function buildProduct(parentId: string, siteCode: string, def: ProductDef): GanttTask {
    const dates = span(d(def.from[0], def.from[1]), d(def.to[0], def.to[1]));
    return {
        id: def.id,
        text: def.text,
        parentId,
        start: dates.start,
        end: dates.end,
        type: "task",
        progress: def.progress,
        color: def.color,
        siteCode,
        sourceSystem: "PPM",
        version: 1,
        custom: {
            level: "product",
            periodLabel: dates.periodLabel,
            status: def.status,
            owner: def.owner
        }
    };
}

function buildProgram(parentId: string, siteCode: string, def: ProgramDef): GanttTask[] {
    const dates = span(d(def.from[0], def.from[1]), d(def.to[0], def.to[1]));
    const program: GanttTask = {
        id: def.id,
        text: def.text,
        parentId,
        start: dates.start,
        end: dates.end,
        type: "project",
        open: true,
        progress: def.progress,
        color: def.color,
        siteCode,
        sourceSystem: "PPM",
        version: 1,
        custom: { level: "program", periodLabel: dates.periodLabel, status: def.status }
    };

    return [program, ...def.products.map(product => buildProduct(def.id, siteCode, product))];
}

function buildCompany(def: CompanyDef): GanttTask[] {
    const year = span(d(1, 1), d(12, 31));
    const company: GanttTask = {
        id: def.id,
        text: def.text,
        start: year.start,
        end: year.end,
        type: "project",
        open: true,
        progress: def.progress,
        color: def.color,
        siteCode: def.siteCode,
        sourceSystem: "PPM",
        version: 1,
        custom: { level: "company", periodLabel: "T1–T52", status: def.status }
    };

    return [company, ...def.programs.flatMap(program => buildProgram(def.id, def.siteCode, program))];
}

const PORTFOLIO: CompanyDef[] = [
    {
        id: "CO-A",
        text: "Company A",
        color: "#1e3a5f",
        siteCode: "HQ-A",
        progress: 0.42,
        status: "in_progress",
        programs: [
            {
                id: "PRG-SAM",
                text: "Samsung Mobile Device Development",
                from: [2, 1],
                to: [12, 31],
                progress: 0.48,
                color: "#1428a0",
                status: "in_progress",
                products: [
                    {
                        id: "PROD-ZFOLD",
                        text: "Samsung Z Fold",
                        from: [6, 1],
                        to: [12, 31],
                        progress: 0.35,
                        color: "#2563eb",
                        status: "in_progress",
                        owner: "Mobile PM"
                    },
                    {
                        id: "PROD-S26",
                        text: "Samsung S26+",
                        from: [2, 1],
                        to: [9, 30],
                        progress: 0.62,
                        color: "#3b82f6",
                        status: "in_progress",
                        owner: "Mobile PM"
                    }
                ]
            },
            {
                id: "PRG-HON",
                text: "Honda Automotive Development",
                from: [1, 15],
                to: [11, 30],
                progress: 0.38,
                color: "#c8102e",
                status: "in_progress",
                products: [
                    {
                        id: "PROD-CRV",
                        text: "Honda CRV",
                        from: [3, 1],
                        to: [11, 30],
                        progress: 0.28,
                        color: "#dc2626",
                        status: "planned",
                        owner: "Auto PM"
                    },
                    {
                        id: "PROD-CIVIC",
                        text: "Honda Civic Hybrid",
                        from: [1, 15],
                        to: [8, 31],
                        progress: 0.55,
                        color: "#ef4444",
                        status: "in_progress",
                        owner: "Auto PM"
                    }
                ]
            }
        ]
    },
    {
        id: "CO-B",
        text: "Company B",
        color: "#0f766e",
        siteCode: "HQ-B",
        progress: 0.25,
        status: "planned",
        programs: [
            {
                id: "PRG-EV",
                text: "EV Battery & Energy Development",
                from: [4, 1],
                to: [10, 31],
                progress: 0.2,
                color: "#0d9488",
                status: "planned",
                products: [
                    {
                        id: "PROD-BATT",
                        text: "Cell module Gen-3",
                        from: [4, 1],
                        to: [10, 15],
                        progress: 0.18,
                        color: "#14b8a6",
                        status: "planned",
                        owner: "Energy PM"
                    },
                    {
                        id: "PROD-BMS",
                        text: "Battery Management System",
                        from: [5, 1],
                        to: [11, 30],
                        progress: 0.12,
                        color: "#2dd4bf",
                        status: "planned",
                        owner: "Energy PM"
                    }
                ]
            }
        ]
    },
    {
        id: "CO-C",
        text: "Company C — Display",
        color: "#4c1d95",
        siteCode: "HQ-C",
        progress: 0.51,
        status: "in_progress",
        programs: [
            {
                id: "PRG-OLED",
                text: "Next-Generation OLED Panel Line",
                from: [3, 1],
                to: [12, 15],
                progress: 0.44,
                color: "#6d28d9",
                status: "in_progress",
                products: [
                    {
                        id: "PROD-OLED-14",
                        text: "OLED 14\" Laptop",
                        from: [3, 15],
                        to: [9, 30],
                        progress: 0.58,
                        color: "#7c3aed",
                        status: "in_progress",
                        owner: "Display PM"
                    },
                    {
                        id: "PROD-OLED-55",
                        text: "OLED 55\" TV Panel",
                        from: [6, 1],
                        to: [12, 15],
                        progress: 0.31,
                        color: "#8b5cf6",
                        status: "in_progress",
                        owner: "Display PM"
                    }
                ]
            }
        ]
    },
    {
        id: "CO-D",
        text: "Company D — Semiconductor",
        color: "#713f12",
        siteCode: "HS-01",
        progress: 0.67,
        status: "in_progress",
        programs: [
            {
                id: "PRG-FAB",
                text: "Fab 3nm Expansion",
                from: [1, 1],
                to: [12, 31],
                progress: 0.55,
                color: "#92400e",
                status: "in_progress",
                products: [
                    {
                        id: "PROD-ETCH",
                        text: "Etch module upgrade",
                        from: [2, 1],
                        to: [7, 31],
                        progress: 0.72,
                        color: "#b45309",
                        status: "in_progress",
                        owner: "Fab PM"
                    },
                    {
                        id: "PROD-CMP",
                        text: "CMP line expansion",
                        from: [5, 1],
                        to: [11, 30],
                        progress: 0.41,
                        color: "#d97706",
                        status: "in_progress",
                        owner: "Fab PM"
                    }
                ]
            }
        ]
    },
    {
        id: "CO-E",
        text: "Company E — Cloud & AI",
        color: "#1d4ed8",
        siteCode: "HQ-E",
        progress: 0.33,
        status: "in_progress",
        programs: [
            {
                id: "PRG-AI",
                text: "Enterprise AI Platform",
                from: [1, 1],
                to: [10, 31],
                progress: 0.36,
                color: "#2563eb",
                status: "in_progress",
                products: [
                    {
                        id: "PROD-LLM",
                        text: "LLM Gateway v2",
                        from: [1, 15],
                        to: [6, 30],
                        progress: 0.48,
                        color: "#3b82f6",
                        status: "in_progress",
                        owner: "AI PM"
                    },
                    {
                        id: "PROD-RAG",
                        text: "Enterprise RAG Suite",
                        from: [4, 1],
                        to: [10, 31],
                        progress: 0.22,
                        color: "#60a5fa",
                        status: "planned",
                        owner: "AI PM"
                    }
                ]
            }
        ]
    },
    {
        id: "CO-F",
        text: "Company F — Logistics",
        color: "#b45309",
        siteCode: "VN-02",
        progress: 0.29,
        status: "planned",
        programs: [
            {
                id: "PRG-WMS",
                text: "Smart Warehouse System",
                from: [2, 1],
                to: [9, 30],
                progress: 0.26,
                color: "#d97706",
                status: "planned",
                products: [
                    {
                        id: "PROD-WMS-CORE",
                        text: "WMS Core rollout",
                        from: [2, 1],
                        to: [6, 30],
                        progress: 0.34,
                        color: "#f59e0b",
                        status: "in_progress",
                        owner: "Logistics PM"
                    },
                    {
                        id: "PROD-AGV",
                        text: "AGV fleet integration",
                        from: [5, 1],
                        to: [9, 30],
                        progress: 0.15,
                        color: "#fbbf24",
                        status: "planned",
                        owner: "Logistics PM"
                    }
                ]
            }
        ]
    },
    {
        id: "CO-G",
        text: "Company G — Healthcare",
        color: "#be123c",
        siteCode: "KR-03",
        progress: 0.46,
        status: "in_progress",
        programs: [
            {
                id: "PRG-MED",
                text: "Medical Imaging Devices",
                from: [3, 1],
                to: [11, 30],
                progress: 0.4,
                color: "#e11d48",
                status: "in_progress",
                products: [
                    {
                        id: "PROD-MRI",
                        text: "MRI Compact 1.5T",
                        from: [3, 1],
                        to: [10, 15],
                        progress: 0.52,
                        color: "#f43f5e",
                        status: "in_progress",
                        owner: "MedTech PM"
                    },
                    {
                        id: "PROD-CT",
                        text: "CT Scanner Gen-4",
                        from: [6, 1],
                        to: [11, 30],
                        progress: 0.27,
                        color: "#fb7185",
                        status: "planned",
                        owner: "MedTech PM"
                    }
                ]
            }
        ]
    },
    {
        id: "CO-H",
        text: "Company H — Renewable Energy",
        color: "#15803d",
        siteCode: "HQ-H",
        progress: 0.37,
        status: "in_progress",
        programs: [
            {
                id: "PRG-RE",
                text: "Wind & Solar Power",
                from: [1, 1],
                to: [12, 31],
                progress: 0.35,
                color: "#16a34a",
                status: "in_progress",
                products: [
                    {
                        id: "PROD-WIND",
                        text: "Wind farm Phase 2",
                        from: [1, 1],
                        to: [8, 31],
                        progress: 0.44,
                        color: "#22c55e",
                        status: "in_progress",
                        owner: "Renewable PM"
                    },
                    {
                        id: "PROD-SOLAR",
                        text: "Solar rooftop 50MW",
                        from: [4, 1],
                        to: [12, 31],
                        progress: 0.28,
                        color: "#4ade80",
                        status: "planned",
                        owner: "Renewable PM"
                    }
                ]
            }
        ]
    },
    {
        id: "CO-I",
        text: "Company I — Retail Digital",
        color: "#c026d3",
        siteCode: "HQ-I",
        progress: 0.31,
        status: "planned",
        programs: [
            {
                id: "PRG-RTL",
                text: "Retail Digital Transformation",
                from: [2, 15],
                to: [11, 30],
                progress: 0.29,
                color: "#d946ef",
                status: "planned",
                products: [
                    {
                        id: "PROD-OMS",
                        text: "OMS omnichannel",
                        from: [2, 15],
                        to: [7, 31],
                        progress: 0.38,
                        color: "#e879f9",
                        status: "in_progress",
                        owner: "Retail PM"
                    },
                    {
                        id: "PROD-POS",
                        text: "Smart POS rollout",
                        from: [6, 1],
                        to: [11, 30],
                        progress: 0.19,
                        color: "#f0abfc",
                        status: "planned",
                        owner: "Retail PM"
                    }
                ]
            }
        ]
    },
    {
        id: "CO-J",
        text: "Company J — Aerospace",
        color: "#475569",
        siteCode: "HQ-J",
        progress: 0.58,
        status: "in_progress",
        programs: [
            {
                id: "PRG-AERO",
                text: "Aviation Components",
                from: [1, 1],
                to: [12, 31],
                progress: 0.54,
                color: "#64748b",
                status: "in_progress",
                products: [
                    {
                        id: "PROD-WING",
                        text: "Composite wing section",
                        from: [1, 1],
                        to: [9, 30],
                        progress: 0.61,
                        color: "#94a3b8",
                        status: "in_progress",
                        owner: "Aero PM"
                    },
                    {
                        id: "PROD-AVION",
                        text: "Avionics package X1",
                        from: [3, 1],
                        to: [12, 15],
                        progress: 0.47,
                        color: "#cbd5e1",
                        status: "in_progress",
                        owner: "Aero PM"
                    }
                ]
            }
        ]
    }
];

const MILESTONES: GanttTask[] = [
    {
        id: "M-GATE",
        text: "Gate review portfolio Q3",
        parentId: "CO-A",
        start: d(7, 15),
        duration: 0,
        type: "milestone",
        siteCode: "HQ-A",
        sourceSystem: "PPM",
        version: 1,
        custom: { level: "milestone", periodLabel: "T28", status: "planned" }
    },
    {
        id: "M-FAB",
        text: "Fab 3nm readiness review",
        parentId: "CO-D",
        start: d(8, 1),
        duration: 0,
        type: "milestone",
        siteCode: "HS-01",
        sourceSystem: "PPM",
        version: 1,
        custom: { level: "milestone", periodLabel: "T31", status: "planned" }
    }
];

/** Executive portfolio mock — 10 company trees for board overview. */
export const MOCK_TASKS: GanttTask[] = [...PORTFOLIO.flatMap(buildCompany), ...MILESTONES];
