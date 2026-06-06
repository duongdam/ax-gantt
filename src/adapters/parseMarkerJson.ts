import type { JsonParseResult, MarkerDef, MarkerPayload } from "../store/types";

function normalizeMarker(raw: Partial<MarkerDef>): MarkerDef | null {
    if (!raw.start_date) {
        return null;
    }
    const date = new Date(raw.start_date);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return {
        start_date: raw.start_date,
        css: raw.css,
        text: raw.text,
        title: raw.title
    };
}

export function parseMarkerJson(input: string | null | undefined): JsonParseResult<MarkerPayload> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!input?.trim()) {
        return { data: { markers: [] }, errors, warnings };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(input);
    } catch {
        errors.push("markerJson is not valid JSON");
        return { data: { markers: [] }, errors, warnings };
    }

    const raw = parsed as Partial<MarkerPayload>;
    if (!Array.isArray(raw.markers)) {
        if (Array.isArray(parsed)) {
            const markers = (parsed as Array<Partial<MarkerDef>>)
                .map(normalizeMarker)
                .filter((m): m is MarkerDef => m !== null);
            return { data: { markers }, errors, warnings };
        }
        warnings.push("markerJson.markers missing — no markers applied");
        return { data: { markers: [] }, errors, warnings };
    }

    const markers = raw.markers.map(normalizeMarker).filter((m): m is MarkerDef => m !== null);
    return { data: { markers }, errors, warnings };
}
