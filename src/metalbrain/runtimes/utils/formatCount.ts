import { round } from "@auaust/toolkit/math";

export function formatCount(value: number): string {
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }

  return value >= 1e3 ? `${round(value / 1e3)}k` : String(value);
}
