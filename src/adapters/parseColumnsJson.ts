import type { ColumnDef, ColumnsPayload, JsonParseResult } from "../store/types";
import { DEFAULT_COLUMNS_PAYLOAD } from "../store/types";

function normalizeColumn(raw: Partial<ColumnDef>): ColumnDef | null {
    if (!raw.name || !raw.label) {
        return null;
    }
    return {
        name: String(raw.name),
        label: String(raw.label),
        width: typeof raw.width === "number" ? raw.width : undefined,
        tree: raw.tree === true,
        align: raw.align === "center" || raw.align === "right" ? raw.align : raw.align === "left" ? "left" : undefined,
        resize: raw.resize !== false,
        template: raw.template ? String(raw.template) : undefined
    };
}

export function parseColumnsJson(input: string | null | undefined): JsonParseResult<ColumnsPayload> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!input?.trim()) {
        return {
            data: { ...DEFAULT_COLUMNS_PAYLOAD, columns: [...DEFAULT_COLUMNS_PAYLOAD.columns] },
            errors,
            warnings
        };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(input);
    } catch {
        errors.push("columnsJson is not valid JSON — using defaults");
        return {
            data: { ...DEFAULT_COLUMNS_PAYLOAD, columns: [...DEFAULT_COLUMNS_PAYLOAD.columns] },
            errors,
            warnings
        };
    }

    const raw = parsed as Partial<ColumnsPayload>;
    if (!Array.isArray(raw.columns) || raw.columns.length === 0) {
        warnings.push("columnsJson.columns empty — using default Project column");
        return {
            data: { ...DEFAULT_COLUMNS_PAYLOAD, columns: [...DEFAULT_COLUMNS_PAYLOAD.columns] },
            errors,
            warnings
        };
    }

    const columns = raw.columns.map(normalizeColumn).filter((c): c is ColumnDef => c !== null);
    if (columns.length === 0) {
        warnings.push("No valid columns in columnsJson — using default");
        return {
            data: { ...DEFAULT_COLUMNS_PAYLOAD, columns: [...DEFAULT_COLUMNS_PAYLOAD.columns] },
            errors,
            warnings
        };
    }

    return { data: { columns }, errors, warnings };
}
