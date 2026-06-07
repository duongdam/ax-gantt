import type { JsonParseResult, ScalePayload } from "../stores/types";
import { DEFAULT_SCALE_PAYLOAD } from "../stores/types";

export function parseScaleJson(input: string | null | undefined): JsonParseResult<ScalePayload> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!input?.trim()) {
        return { data: { ...DEFAULT_SCALE_PAYLOAD }, errors, warnings };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(input);
    } catch {
        errors.push("scaleJson is not valid JSON — using defaults");
        return { data: { ...DEFAULT_SCALE_PAYLOAD }, errors, warnings };
    }

    const raw = parsed as Partial<ScalePayload>;
    const anchorYear = typeof raw.anchorYear === "number" ? raw.anchorYear : DEFAULT_SCALE_PAYLOAD.anchorYear;
    const weekLabelFormat =
        raw.weekLabelFormat === "T##" || raw.weekLabelFormat === "W##"
            ? raw.weekLabelFormat
            : DEFAULT_SCALE_PAYLOAD.weekLabelFormat;

    const scales =
        Array.isArray(raw.scales) && raw.scales.length > 0
            ? raw.scales.filter(s => s && typeof s.unit === "string")
            : DEFAULT_SCALE_PAYLOAD.scales;

    return {
        data: { anchorYear, weekLabelFormat, scales },
        errors,
        warnings
    };
}
