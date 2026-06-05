import { DhlGanttChartPreviewProps } from "../typings/DhlGanttChartProps";

export type Platform = "web" | "desktop";

export type Properties = PropertyGroup[];

type PropertyGroup = {
    caption: string;
    propertyGroups?: PropertyGroup[];
    properties?: Property[];
};

type Property = {
    key: string;
    caption: string;
    description?: string;
    objectHeaders?: string[];
    objects?: ObjectProperties[];
    properties?: Properties[];
};

type ObjectProperties = {
    properties: PropertyGroup[];
    captions?: string[];
};

export type Problem = {
    property?: string;
    severity?: "error" | "warning" | "deprecation";
    message: string;
    studioMessage?: string;
    url?: string;
    studioUrl?: string;
};

const DATA_GROUPS = ["Data — Tasks", "Data — Links", "Data — Resources", "Data — Assignments"];
const EDIT_GROUPS = ["Task Editing", "Links", "Scheduling (PRO)", "Export & Undo (PRO)"];

function filterGroups(groups: PropertyGroup[], hiddenCaptions: Set<string>): PropertyGroup[] {
    return groups
        .filter(group => !hiddenCaptions.has(group.caption))
        .map(group => ({
            ...group,
            propertyGroups: group.propertyGroups ? filterGroups(group.propertyGroups, hiddenCaptions) : undefined
        }));
}

export function getProperties(values: DhlGanttChartPreviewProps, defaultProperties: Properties): Properties {
    const hidden = new Set<string>();

    if (values.useMockData) {
        DATA_GROUPS.forEach(caption => hidden.add(caption));
    }

    if (values.readOnly) {
        EDIT_GROUPS.forEach(caption => hidden.add(caption));
    }

    return filterGroups(defaultProperties, hidden);
}

function isPreviewDatasourceConfigured(
    datasource: DhlGanttChartPreviewProps["tasksDataSource"]
): boolean {
    return datasource !== null && typeof datasource === "object" && "type" in datasource;
}

export function check(values: DhlGanttChartPreviewProps): Problem[] {
    const problems: Problem[] = [];

    if (!values.useMockData && !isPreviewDatasourceConfigured(values.tasksDataSource)) {
        problems.push({
            property: "tasksDataSource",
            severity: "error",
            message: "S001: tasksDataSource is required when useMockData is false"
        });
    }

    if (
        (values.viewMode === "resourceTimeline" || values.viewMode === "hybrid") &&
        !values.useMockData &&
        !isPreviewDatasourceConfigured(values.resourcesDataSource)
    ) {
        problems.push({
            property: "resourcesDataSource",
            severity: "error",
            message: "S002: resourcesDataSource is required for resourceTimeline viewMode"
        });
    }

    if (!values.useMockData && isPreviewDatasourceConfigured(values.tasksDataSource) && !values.taskId) {
        problems.push({
            property: "taskId",
            severity: "error",
            message: "S004: taskId is a required task mapping"
        });
    }

    if (!values.useMockData && isPreviewDatasourceConfigured(values.tasksDataSource) && !values.taskStart) {
        problems.push({
            property: "taskStart",
            severity: "error",
            message: "S004: taskStart is a required task mapping"
        });
    }

    if (values.advancedConfigJson?.trim()) {
        try {
            JSON.parse(values.advancedConfigJson);
        } catch {
            problems.push({
                property: "advancedConfigJson",
                severity: "error",
                message: "S003: advancedConfigJson is not valid JSON"
            });
        }
    }

    const proFeatures = [
        { key: "enableBaselines", enabled: values.enableBaselines },
        { key: "autoScheduling", enabled: values.autoScheduling },
        { key: "showCriticalPath", enabled: values.showCriticalPath },
        { key: "enableUndo", enabled: values.enableUndo },
        { key: "enableExport", enabled: values.enableExport },
        { key: "showResourceHistogram", enabled: values.showResourceHistogram }
    ] as const;

    for (const feature of proFeatures) {
        if (feature.enabled && !values.licenseKey?.trim()) {
            problems.push({
                property: feature.key,
                severity: "warning",
                message: `W102: ${feature.key} requires a commercial licenseKey`
            });
        }
    }

    if (values.taskEnd && values.taskDuration) {
        problems.push({
            property: "taskDuration",
            severity: "warning",
            message: "W201: Both taskEnd and taskDuration mapped; duration takes precedence at runtime"
        });
    }

    return problems;
}

export function getCustomCaption(values: DhlGanttChartPreviewProps): string {
    if (values.useMockData) {
        return "DHL Gantt (mock)";
    }
    return "DHL Gantt Chart";
}
