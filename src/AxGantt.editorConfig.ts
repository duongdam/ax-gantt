import { AxGanttPreviewProps } from "../typings/AxGanttProps";

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

const DATA_JSON_GROUP = "Data (JSON)";
const INTERACTION_GROUP = "Interaction";

function filterGroups(groups: PropertyGroup[], hiddenCaptions: Set<string>): PropertyGroup[] {
    return groups
        .filter(group => !hiddenCaptions.has(group.caption))
        .map(group => ({
            ...group,
            propertyGroups: group.propertyGroups ? filterGroups(group.propertyGroups, hiddenCaptions) : undefined
        }));
}

export function getProperties(values: AxGanttPreviewProps, defaultProperties: Properties): Properties {
    const hidden = new Set<string>();

    if (values.useMockData) {
        hidden.add(DATA_JSON_GROUP);
    }

    if (values.readOnly || !values.mayEdit) {
        hidden.add(INTERACTION_GROUP);
    }

    return filterGroups(defaultProperties, hidden);
}

function isExpressionConfigured(value: string | undefined): boolean {
    return typeof value === "string" && value.trim().length > 0;
}

function validateJsonExpression(
    property: string,
    value: string | undefined,
    problems: Problem[],
    allowEmpty = true
): void {
    if (!isExpressionConfigured(value)) {
        if (!allowEmpty) {
            problems.push({
                property,
                severity: "error",
                message: `${property} expression is required when useMockData is false`
            });
        }
        return;
    }

    try {
        JSON.parse(value!);
    } catch {
        problems.push({
            property,
            severity: "warning",
            message: `W301: ${property} preview value is not valid JSON — runtime expression must return valid JSON`
        });
    }
}

export function check(values: AxGanttPreviewProps): Problem[] {
    const problems: Problem[] = [];

    if (!values.useMockData && !isExpressionConfigured(values.taskListJson)) {
        problems.push({
            property: "taskListJson",
            severity: "error",
            message: "S001: taskListJson is required when useMockData is false"
        });
    }

    if (!values.useMockData) {
        validateJsonExpression("taskListJson", values.taskListJson, problems, false);
    }

    validateJsonExpression("scaleJson", values.scaleJson, problems);
    validateJsonExpression("columnsJson", values.columnsJson, problems);
    validateJsonExpression("markerJson", values.markerJson, problems);

    if (values.enableMarker && !isExpressionConfigured(values.markerJson)) {
        problems.push({
            property: "markerJson",
            severity: "warning",
            message: "W302: enableMarker is true but markerJson is empty"
        });
    }

    if (values.readOnly && values.mayEdit) {
        problems.push({
            property: "mayEdit",
            severity: "warning",
            message: "W303: readOnly=true overrides mayEdit — chart will be read-only"
        });
    }

    return problems;
}

export function getCustomCaption(values: AxGanttPreviewProps): string {
    if (values.useMockData) {
        return "Ax Gantt (mock)";
    }
    if (values.roadmapNo) {
        return `Ax Gantt · ${values.roadmapNo}`;
    }
    return "Ax Gantt";
}
