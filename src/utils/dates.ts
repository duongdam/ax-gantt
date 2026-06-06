const DHTMLX_DATE_FORMAT = "%Y-%m-%d %H:%i";

export function formatDhtmlxDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
        [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-") +
        ` ${pad(date.getHours())}:${pad(date.getMinutes())}`
    );
}

export function getDefaultDhtmlxDateFormat(): string {
    return DHTMLX_DATE_FORMAT;
}
