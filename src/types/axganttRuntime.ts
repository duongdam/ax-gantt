import type { DynamicValue } from "mendix";

export function readDynamicString(value?: DynamicValue<string>): string | null {
    if (!value || value.status !== "available") {
        return null;
    }
    return value.value ?? null;
}

export function readDynamicDate(value?: DynamicValue<Date>): Date | undefined {
    if (!value || value.status !== "available" || !value.value) {
        return undefined;
    }
    return value.value;
}
