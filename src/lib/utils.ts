import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mergeUnique<T extends Array<unknown>>(arr1: T, arr2: T) {
  return [...new Set([...(arr1 ?? []), ...(arr2 ?? [])])];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
