import type { GanttLink } from "../store/types";

export interface DhtmlxLink {
    id: string;
    source: string;
    target: string;
    type: string;
    lag?: number;
}

export function mapLinks(links: GanttLink[]): DhtmlxLink[] {
    return links.map(link => ({
        id: String(link.id),
        source: String(link.source),
        target: String(link.target),
        type: String(link.type),
        lag: link.lag ?? 0
    }));
}

export function parseLinkType(value: string | number | undefined): 0 | 1 | 2 | 3 {
    const numeric = typeof value === "number" ? value : Number.parseInt(String(value ?? "0"), 10);
    if (numeric >= 0 && numeric <= 3) {
        return numeric as 0 | 1 | 2 | 3;
    }
    return 0;
}
