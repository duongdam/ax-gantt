import type { ListAttributeValue, ListValue, ObjectItem } from "mendix";
import type { Big } from "big.js";

/** Subset of widget props consumed by Mendix datasource mapping (matches DhlGanttChart.xml). */
export interface MendixDatasourceProps {
    tasksDataSource?: ListValue;
    taskId?: ListAttributeValue<string | Big>;
    taskLabel?: ListAttributeValue<string | Big>;
    taskStart?: ListAttributeValue<Date>;
    taskEnd?: ListAttributeValue<Date>;
    taskDuration?: ListAttributeValue<Big>;
    taskParentId?: ListAttributeValue<string | Big>;
    taskProgress?: ListAttributeValue<Big>;
    taskType?: ListAttributeValue<string | Big>;
    taskOpen?: ListAttributeValue<boolean>;
    taskReadOnly?: ListAttributeValue<boolean>;
    taskColor?: ListAttributeValue<string | Big>;
    taskSiteCode?: ListAttributeValue<string | Big>;
    taskSourceSystem?: ListAttributeValue<string | Big>;
    taskStatus?: ListAttributeValue<string | Big>;
    taskVersion?: ListAttributeValue<string | Big>;
    taskModifiedAt?: ListAttributeValue<Date>;

    linksDataSource?: ListValue;
    linkId?: ListAttributeValue<string | Big>;
    linkSource?: ListAttributeValue<string | Big>;
    linkTarget?: ListAttributeValue<string | Big>;
    linkType?: ListAttributeValue<string | Big>;
    linkLag?: ListAttributeValue<Big>;

    resourcesDataSource?: ListValue;
    resourceId?: ListAttributeValue<string | Big>;
    resourceName?: ListAttributeValue<string | Big>;
    resourceType?: ListAttributeValue<string | Big>;
    resourceSiteCode?: ListAttributeValue<string | Big>;
    resourceDepartment?: ListAttributeValue<string | Big>;
    resourceCapacity?: ListAttributeValue<Big>;

    assignmentsDataSource?: ListValue;
    assignmentId?: ListAttributeValue<string | Big>;
    assignmentTaskId?: ListAttributeValue<string | Big>;
    assignmentResourceId?: ListAttributeValue<string | Big>;
    assignmentValue?: ListAttributeValue<Big>;
    assignmentStart?: ListAttributeValue<Date>;
    assignmentEnd?: ListAttributeValue<Date>;
}

export interface MendixParseIssue {
    code: string;
    message: string;
    entityId?: string;
}

export interface MendixLoadResult {
    model: import("../store/types").GanttNormalizedModel;
    issues: MendixParseIssue[];
    isLoading: boolean;
    error: string | null;
}

export type MendixItemMapper<T> = (item: ObjectItem, index: number) => T | null;
