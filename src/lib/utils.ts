import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Leoistic Year Months mapping (Leo fiscal year begins July 1st)
 * 1 = July, 2 = August, ... 12 = June
 */
export function getMonth(monthNumber: number | string): string {
  const num = typeof monthNumber === "string" ? parseInt(monthNumber, 10) : monthNumber;
  const months: Record<number, string> = {
    1: "July",
    2: "August",
    3: "September",
    4: "October",
    5: "November",
    6: "December",
    7: "January",
    8: "February",
    9: "March",
    10: "April",
    11: "May",
    12: "June",
  };
  return months[num] || "Unknown";
}

export function formatCurrency(value: number | string | undefined): string {
  if (value === undefined || value === null) return "0.00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Returns the Leoistic fiscal month number (1 = July ... 12 = June) from an ISO or date string.
 */
export function getLeoMonthFromDate(dateStr: string): number {
  if (!dateStr) return 1;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 1;
  const calMonth = d.getMonth(); // 0 = Jan .. 11 = Dec
  return calMonth >= 6 ? calMonth - 5 : calMonth + 7;
}

export function isValidUrl(url: string): boolean {
  try {
    const formatted = new URL(url);
    return !!formatted;
  } catch {
    return false;
  }
}

export function isValidFile(file: unknown): boolean {
  return file instanceof File;
}

