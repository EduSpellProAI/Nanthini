export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
export function roundTo(value, decimals = 2) {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
}
export function createId(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
export function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
}
