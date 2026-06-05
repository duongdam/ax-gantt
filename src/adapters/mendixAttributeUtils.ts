import type { ListAttributeValue, ObjectItem } from "mendix";
import { ValueStatus } from "mendix";
import type { Big } from "big.js";

type StringAttr = ListAttributeValue<string | Big> | undefined;
type NumberAttr = ListAttributeValue<Big> | undefined;
type DateAttr = ListAttributeValue<Date> | undefined;
type BooleanAttr = ListAttributeValue<boolean> | undefined;

function isAvailable(status: ValueStatus): boolean {
    return status === ValueStatus.Available || status === ValueStatus.Loading;
}

export function readStringAttribute(attr: StringAttr, item: ObjectItem): string | undefined {
    if (!attr) {
        return undefined;
    }

    const value = attr.get(item);
    if (!isAvailable(value.status) || value.value === undefined || value.value === null) {
        return undefined;
    }

    return String(value.value).trim();
}

export function readNumberAttribute(attr: NumberAttr, item: ObjectItem): number | undefined {
    if (!attr) {
        return undefined;
    }

    const value = attr.get(item);
    if (!isAvailable(value.status) || value.value === undefined || value.value === null) {
        return undefined;
    }

    const numeric = Number(value.value);
    return Number.isFinite(numeric) ? numeric : undefined;
}

export function readBooleanAttribute(attr: BooleanAttr, item: ObjectItem): boolean | undefined {
    if (!attr) {
        return undefined;
    }

    const value = attr.get(item);
    if (!isAvailable(value.status) || value.value === undefined || value.value === null) {
        return undefined;
    }

    return Boolean(value.value);
}

export function readDateAttribute(attr: DateAttr, item: ObjectItem): Date | undefined {
    if (!attr) {
        return undefined;
    }

    const value = attr.get(item);
    if (!isAvailable(value.status) || !value.value) {
        return undefined;
    }

    return value.value instanceof Date ? value.value : new Date(value.value);
}

export function readProgressAttribute(attr: NumberAttr, item: ObjectItem): number | undefined {
    const progress = readNumberAttribute(attr, item);
    if (progress === undefined) {
        return undefined;
    }

    if (progress > 1) {
        return Math.min(1, Math.max(0, progress / 100));
    }

    return Math.min(1, Math.max(0, progress));
}
