var previousTime = Number(new Date());

export function lerp(v1: number, v2: number, progress: number): number {
  return (v1 * (1 - progress) + v2 * progress);
}

export function checkpoint(message: String) {
  console.log(message + ": " + Math.floor((Number(new Date()) - previousTime) * 10) / 10000 + " sec.");
  previousTime = Number(new Date());
}

export function distSq(p1: number[], p2: number[]): number {
  return (Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

export function mapping(value: number, inFrom: number, inTo: number, outFrom: number, outTo: number): number {
  return (((value - inFrom) / (inTo - inFrom)) * (outTo - outFrom)) + outFrom;
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));