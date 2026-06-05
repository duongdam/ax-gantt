import type { GanttAssignment } from "../../store/types";

export const MOCK_ASSIGNMENTS: GanttAssignment[] = [
    { id: "A-1", taskId: "PROD-S26", resourceId: "R-02", value: 6 },
    { id: "A-2", taskId: "PROD-ZFOLD", resourceId: "R-02", value: 8 },
    { id: "A-3", taskId: "PROD-CRV", resourceId: "R-03", value: 5 },
    { id: "A-4", taskId: "PROD-CIVIC", resourceId: "R-03", value: 4 },
    { id: "A-5", taskId: "PROD-BATT", resourceId: "R-04", value: 7 },
    { id: "A-6", taskId: "PROD-ETCH", resourceId: "R-05", value: 10 },
    { id: "A-7", taskId: "PROD-LLM", resourceId: "R-06", value: 6 },
    { id: "A-8", taskId: "PROD-WMS-CORE", resourceId: "R-07", value: 5 },
    { id: "A-9", taskId: "PROD-MRI", resourceId: "R-08", value: 4 },
    { id: "A-10", taskId: "PROD-WING", resourceId: "R-01", value: 6 }
];
