export function formatTime(seconds: number): string {
    const hrs = math.floor(seconds / 3600);
    const mins = math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);

    return parts.join(" ");
}

export function formatNumberCompact(value: number): string {
    if (value >= 1e18) {
        return `${math.floor(value / 1e17) / 10}Q`; // quintillion
    } else if (value >= 1e15) {
        return `${math.floor(value / 1e14) / 10}q`; // quadrillion
    } else if (value >= 1e12) {
        return `${math.floor(value / 1e11) / 10}t`; // trillion
    } else if (value >= 1e9) {
        return `${math.floor(value / 1e8) / 10}b`; // billion
    } else if (value >= 1e6) {
        return `${math.floor(value / 1e5) / 10}m`; // million
    } else if (value >= 1e3) {
        return `${math.floor(value / 1e2) / 10}k`; // thousand
    } else {
        return tostring(value);
    }
}
