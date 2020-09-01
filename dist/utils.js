var previousTime = Number(new Date());
export function lerp(v1, v2, progress) {
    return (v1 * (1 - progress) + v2 * progress);
}
export function checkpoint(message) {
    console.log(message + ": " + Math.floor((Number(new Date()) - previousTime) * 10) / 10000 + " sec.");
    previousTime = Number(new Date());
}
export function distSq(p1, p2) {
    return (Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}
export function mapping(value, inFrom, inTo, outFrom, outTo) {
    return (((value - inFrom) / (inTo - inFrom)) * (outTo - outFrom)) + outFrom;
}
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
