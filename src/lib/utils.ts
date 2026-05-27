import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convert agorot (integer) to formatted ILS string. 100 ₪ = 10000 agorot. */
export function formatILS(agorot: number): string {
  const shekels = Math.floor(agorot / 100);
  const remainder = agorot % 100;
  if (remainder === 0) return `${shekels} ₪`;
  return `${shekels}.${remainder.toString().padStart(2, "0")} ₪`;
}

/** Format seconds into mm:ss */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/** Format minutes into human-readable Hebrew */
export function formatMinutes(minutes: number): string {
  if (minutes < 1) return "פחות מדקה";
  if (minutes === 1) return "דקה";
  return `${minutes} דקות`;
}
