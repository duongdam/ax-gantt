import { useMemo } from "react";
import type { ThemeConfig } from "antd";
import { theme } from "antd";

/**
 * Reads Mendix Atlas UI CSS custom properties from :root and maps them
 * to antd design tokens, so the widget automatically matches the host page theme.
 *
 * Fallback values are used when running outside Mendix (dev/mock mode).
 */
function readCssVar(name: string, fallback: string): string {
    if (typeof document === "undefined") return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
}

function parsePx(value: string, fallback: number): number {
    const n = parseFloat(value);
    return isNaN(n) ? fallback : n;
}

export function useAtlasTheme(): ThemeConfig {
    return useMemo<ThemeConfig>(() => {
        // Atlas UI variables → antd tokens
        // See: https://docs.mendix.com/apidocs-mxsdk/apidocs/design-properties/
        const colorPrimary = readCssVar("--color-brand-primary", "#D40511");
        const colorSuccess = readCssVar("--color-feedback-success", "#52c41a");
        const colorWarning = readCssVar("--color-feedback-warning", "#faad14");
        const colorError = readCssVar("--color-feedback-danger", "#ff4d4f");
        const colorText = readCssVar("--color-text-default", "#262626");
        const colorBgContainer = readCssVar("--color-bg-default", "#ffffff");
        const borderRadiusRaw = readCssVar("--border-radius-default", "4px");
        const fontFamily = readCssVar("--font-family-default", "inherit");
        const fontSizeRaw = readCssVar("--font-size-default", "14px");

        return {
            algorithm: theme.defaultAlgorithm,
            token: {
                colorPrimary,
                colorSuccess,
                colorWarning,
                colorError,
                colorText,
                colorBgContainer,
                borderRadius: parsePx(borderRadiusRaw, 4),
                fontFamily: fontFamily || "inherit",
                fontSize: parsePx(fontSizeRaw, 14)
            }
        };
    }, []); // CSS vars are static per page load — no need to re-compute
}
