import type { GanttAssignment } from "../store/types";

export interface DhtmlxAssignment {
    id: string;
    task_id: string;
    resource_id: string;
    value: number;
    start_date?: string;
    end_date?: string;
}

export function mapAssignmentToDhtmlx(
    assignment: GanttAssignment,
    formatDate: (date: Date) => string
): DhtmlxAssignment {
    const dhtmlxAssignment: DhtmlxAssignment = {
        id: String(assignment.id),
        task_id: String(assignment.taskId),
        resource_id: String(assignment.resourceId),
        value: assignment.value
    };

    if (assignment.start) {
        dhtmlxAssignment.start_date = formatDate(assignment.start);
    }

    if (assignment.end) {
        dhtmlxAssignment.end_date = formatDate(assignment.end);
    }

    return dhtmlxAssignment;
}

export function mapAssignments(
    assignments: GanttAssignment[],
    formatDate: (date: Date) => string
): DhtmlxAssignment[] {
    return assignments.map(assignment => mapAssignmentToDhtmlx(assignment, formatDate));
}
