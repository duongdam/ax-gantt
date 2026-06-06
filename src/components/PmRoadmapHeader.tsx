import { ReactElement, useMemo } from "react";

export interface PmRoadmapHeaderProps {
    roadmapNo?: string;
    roadmapRevision?: string;
    roadmapRevisedBy?: string;
    roadmapRevisedAt?: Date;
}

interface HeaderSegment {
    label: string;
    value: string;
}

function formatRevisedAt(date: Date): string {
    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function PmRoadmapHeader({
    roadmapNo,
    roadmapRevision,
    roadmapRevisedBy,
    roadmapRevisedAt
}: PmRoadmapHeaderProps): ReactElement | null {
    const segments = useMemo<HeaderSegment[]>(() => {
        const items: HeaderSegment[] = [];

        if (roadmapNo?.trim()) {
            items.push({ label: "No", value: roadmapNo.trim() });
        }
        if (roadmapRevision?.trim()) {
            items.push({ label: "Rev", value: roadmapRevision.trim() });
        }
        if (roadmapRevisedBy?.trim()) {
            items.push({ label: "By", value: roadmapRevisedBy.trim() });
        }
        if (roadmapRevisedAt) {
            items.push({ label: "At", value: formatRevisedAt(roadmapRevisedAt) });
        }

        return items;
    }, [roadmapNo, roadmapRevision, roadmapRevisedBy, roadmapRevisedAt]);

    if (segments.length === 0) {
        return null;
    }

    return (
        <div className="axgantt-roadmap-header" role="doc-subtitle" aria-label="Roadmap document metadata">
            {segments.map((segment, index) => (
                <span key={segment.label} className="axgantt-roadmap-header__segment">
                    {index > 0 && <span className="axgantt-roadmap-header__divider" aria-hidden="true" />}
                    <span className="axgantt-roadmap-header__label">{segment.label}:</span>
                    <span className="axgantt-roadmap-header__value">{segment.value}</span>
                </span>
            ))}
        </div>
    );
}
