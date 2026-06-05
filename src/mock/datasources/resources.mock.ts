import type { GanttResource } from "../../store/types";

export const MOCK_RESOURCES: GanttResource[] = [
    { id: "R-01", name: "Program Office", type: "human", siteCode: "HQ-A", department: "PMO", capacity: 8 },
    { id: "R-02", name: "Mobile Engineering", type: "human", siteCode: "HQ-A", department: "R&D", capacity: 12 },
    { id: "R-03", name: "Auto Engineering", type: "human", siteCode: "HQ-A", department: "R&D", capacity: 10 },
    { id: "R-04", name: "Energy Lab", type: "room", siteCode: "HQ-B", department: "Battery", capacity: 16 },
    { id: "R-05", name: "Fab Bay 3", type: "machine", siteCode: "HS-01", department: "Fab", capacity: 24 },
    { id: "R-06", name: "AI Platform Team", type: "human", siteCode: "HQ-E", department: "Digital", capacity: 8 },
    { id: "R-07", name: "Warehouse Zone A", type: "room", siteCode: "VN-02", department: "Logistics", capacity: 20 },
    { id: "R-08", name: "MedTech QA", type: "human", siteCode: "KR-03", department: "Quality", capacity: 6 }
];
