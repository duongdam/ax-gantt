import type { GanttResource, GanttResourceType } from "../store/types";

export interface DhtmlxResource {
    id: string;
    text: string;
    capacity?: number;
    [key: string]: unknown;
}

const RESOURCE_TYPES: GanttResourceType[] = ["human", "machine", "room", "vendor", "other"];

export function parseResourceType(value: string | undefined): GanttResourceType | undefined {
    if (!value) {
        return undefined;
    }
    const normalized = value.toLowerCase() as GanttResourceType;
    return RESOURCE_TYPES.includes(normalized) ? normalized : "other";
}

export function mapResourceToDhtmlx(resource: GanttResource): DhtmlxResource {
    const dhtmlxResource: DhtmlxResource = {
        id: String(resource.id),
        text: resource.name.trim().slice(0, 200)
    };

    if (resource.capacity !== undefined) {
        dhtmlxResource.capacity = resource.capacity;
    }

    if (resource.siteCode) {
        dhtmlxResource.siteCode = resource.siteCode;
    }

    if (resource.department) {
        dhtmlxResource.department = resource.department;
    }

    return dhtmlxResource;
}

export function mapResources(resources: GanttResource[]): DhtmlxResource[] {
    return resources.map(mapResourceToDhtmlx);
}
