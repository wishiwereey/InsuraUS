import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** $8,640 — whole dollars, the way households think about premiums. */
export const formatUSD = (n: number) => usd0.format(Math.round(n));

/** +$1,240 / −$180 */
export const formatSignedUSD = (n: number) => `${n >= 0 ? "+" : "−"}${usd0.format(Math.abs(Math.round(n)))}`;

/** $1.2k for chart axes. */
export const formatCompactUSD = (n: number) =>
  Math.abs(n) >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${Math.round(n)}`;

export const formatBytes = (b: number) =>
  b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;
