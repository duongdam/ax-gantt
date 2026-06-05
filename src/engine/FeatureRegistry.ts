import type { GanttTask } from "../store/types";

export interface FeatureFlags {
    readOnly: boolean;
    showGrid: boolean;
    showChart: boolean;
    enableDragMove: boolean;
    enableResize: boolean;
    enableProgressDrag: boolean;
    enableLinkDraw: boolean;
    enableMultiselect: boolean;
    enableKeyboard: boolean;
    enableTooltips: boolean;
    showTodayMarker: boolean;
    highlightWeekends: boolean;
    autoScheduling: boolean;
    showCriticalPath: boolean;
    enableBaselines: boolean;
    enableUndo: boolean;
    enableExport: boolean;
    showResourceHistogram: boolean;
}

export type ProFeatureKey =
    | "autoScheduling"
    | "showCriticalPath"
    | "enableBaselines"
    | "enableUndo"
    | "enableExport"
    | "showResourceHistogram";

export type PartialFeatureFlags = Partial<FeatureFlags>;

export interface FeatureRegistryOptions extends PartialFeatureFlags {
    licenseKey?: string;
    isOffline?: boolean;
}

const PRO_FEATURES: ProFeatureKey[] = [
    "autoScheduling",
    "showCriticalPath",
    "enableBaselines",
    "enableUndo",
    "enableExport",
    "showResourceHistogram"
];

const defaultFlags: FeatureFlags = {
    readOnly: false,
    showGrid: true,
    showChart: true,
    enableDragMove: true,
    enableResize: true,
    enableProgressDrag: true,
    enableLinkDraw: true,
    enableMultiselect: true,
    enableKeyboard: true,
    enableTooltips: true,
    showTodayMarker: true,
    highlightWeekends: true,
    autoScheduling: false,
    showCriticalPath: false,
    enableBaselines: false,
    enableUndo: false,
    enableExport: false,
    showResourceHistogram: false
};

export class FeatureRegistry {
    private flags: FeatureFlags;
    private licensed: boolean;
    private offline: boolean;
    private requestedPro: Partial<Record<ProFeatureKey, boolean>> = {};

    constructor(initial: FeatureRegistryOptions = {}) {
        const { licenseKey, isOffline, ...requested } = initial;
        this.licensed = Boolean(licenseKey?.trim());
        this.offline = Boolean(isOffline);

        for (const key of PRO_FEATURES) {
            if (requested[key] !== undefined) {
                this.requestedPro[key] = requested[key];
            }
        }

        this.flags = { ...defaultFlags, ...requested };
        this.applyLicenseGates();
        this.applyOfflineGuard();
        this.applyReadOnlyOverride();
    }

    getFlags(): Readonly<FeatureFlags> {
        return this.flags;
    }

    isLicensed(): boolean {
        return this.licensed;
    }

    isOffline(): boolean {
        return this.offline;
    }

    update(partial: FeatureRegistryOptions): void {
        const { licenseKey, isOffline, ...requested } = partial;

        if (licenseKey !== undefined) {
            this.licensed = Boolean(licenseKey.trim());
        }

        if (isOffline !== undefined) {
            this.offline = Boolean(isOffline);
        }

        for (const key of PRO_FEATURES) {
            if (requested[key] !== undefined) {
                this.requestedPro[key] = requested[key];
            }
        }

        this.flags = { ...this.flags, ...requested };
        this.applyLicenseGates();
        this.applyOfflineGuard();
        this.applyReadOnlyOverride();
    }

    isEnabled(key: keyof FeatureFlags): boolean {
        return this.flags[key];
    }

    isProFeatureEnabled(key: ProFeatureKey): boolean {
        return this.licensed && this.flags[key];
    }

    wasProFeatureRequested(key: ProFeatureKey): boolean {
        return Boolean(this.requestedPro[key]);
    }

    /** Layered edit permission: widget readOnly OR per-task readonly (FR-020a). */
    isTaskEditable(task?: Pick<GanttTask, "readonly"> | null): boolean {
        if (this.flags.readOnly || this.offline) {
            return false;
        }
        return !task?.readonly;
    }

    private applyLicenseGates(): void {
        if (this.licensed) {
            return;
        }

        for (const key of PRO_FEATURES) {
            this.flags[key] = false;
        }
    }

    private applyOfflineGuard(): void {
        if (!this.offline) {
            return;
        }

        this.flags.readOnly = true;
        this.flags.enableDragMove = false;
        this.flags.enableResize = false;
        this.flags.enableProgressDrag = false;
        this.flags.enableLinkDraw = false;
        this.flags.enableMultiselect = false;
        this.flags.autoScheduling = false;
        this.flags.enableUndo = false;
        this.flags.enableExport = false;
    }

    private applyReadOnlyOverride(): void {
        if (!this.flags.readOnly) {
            return;
        }

        this.flags.enableDragMove = false;
        this.flags.enableResize = false;
        this.flags.enableProgressDrag = false;
        this.flags.enableLinkDraw = false;
        this.flags.enableMultiselect = false;
        this.flags.autoScheduling = false;
        this.flags.enableUndo = false;
    }
}
