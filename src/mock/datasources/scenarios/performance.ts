import type { GanttAssignment, GanttLink, GanttNormalizedModel, GanttResource, GanttTask } from "../../../store/types";
import { MOCK_LINKS } from "../links.mock";
import { MOCK_RESOURCES } from "../resources.mock";

const BASE_START = new Date("2026-06-01T08:00:00");

function addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function buildPerformanceTasks(count = 500): GanttTask[] {
    const tasks: GanttTask[] = [];
    const sites = ["HS-01", "VN-02", "KR-03"];
    const systems = ["MES", "EAM", "APS", "PPM"];

    for (let index = 0; index < count; index += 1) {
        const siteCode = sites[index % sites.length];
        const start = addDays(BASE_START, index % 90);
        const end = addDays(start, 1 + (index % 5));

        tasks.push({
            id: `PERF-${index + 1}`,
            text: `Schedule task ${index + 1}`,
            start,
            end,
            progress: (index % 10) / 10,
            siteCode,
            sourceSystem: systems[index % systems.length],
            type: index % 17 === 0 ? "milestone" : "task",
            custom: { status: index % 2 === 0 ? "in_progress" : "planned" }
        });
    }

    return tasks;
}

function buildPerformanceLinks(tasks: GanttTask[]): GanttLink[] {
    const links: GanttLink[] = [];

    for (let index = 1; index < tasks.length; index += 7) {
        links.push({
            id: `PL-${index}`,
            source: tasks[index - 1].id,
            target: tasks[index].id,
            type: 0
        });
    }

    return links;
}

function buildPerformanceResources(): GanttResource[] {
    return [
        ...MOCK_RESOURCES,
        {
            id: "R-04",
            name: "Litho Track A",
            type: "machine",
            siteCode: "HS-01",
            department: "Fab",
            capacity: 8
        }
    ];
}

function buildPerformanceAssignments(tasks: GanttTask[]): GanttAssignment[] {
    const assignments: GanttAssignment[] = [];

    tasks.slice(0, 120).forEach((task, index) => {
        assignments.push({
            id: `PA-${index + 1}`,
            taskId: task.id,
            resourceId: index % 2 === 0 ? "R-01" : "R-04",
            value: 4 + (index % 6)
        });
    });

    // Deliberate over-allocation on R-01 for HS-01 tasks
    assignments.push({
        id: "PA-OVER",
        taskId: tasks[0]?.id ?? "PERF-1",
        resourceId: "R-01",
        value: 18
    });

    return assignments;
}

export function getPerformanceScenario(taskCount = 500): GanttNormalizedModel {
    const tasks = buildPerformanceTasks(taskCount);
    return {
        tasks,
        links: [...MOCK_LINKS, ...buildPerformanceLinks(tasks)],
        resources: buildPerformanceResources(),
        assignments: buildPerformanceAssignments(tasks)
    };
}
