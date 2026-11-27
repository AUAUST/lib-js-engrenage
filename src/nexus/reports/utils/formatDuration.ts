import { round } from "@auaust/toolkit/math";

/**
 * `milliseconds` as a short duration: whole milliseconds below a second, seconds
 * with two decimals from one.
 *
 * @pure
 */
export function formatDuration(milliseconds: number): string {
  const rounded = round(milliseconds);

  return rounded < 1000
    ? `${rounded}ms`
    : `${(milliseconds / 1000).toFixed(2)}s`;
}
