import { floor } from "@auaust/toolkit/math";

import {
  baselineWidelyAvailableMonths,
  monthsPerYear,
} from "#typescript/constants";

export function toBaselineYear(snapshot: string): number {
  const [year = 0, month = 0] = snapshot.split("-").map(Number);

  const widelyAvailable =
    year * monthsPerYear + month - 1 - baselineWidelyAvailableMonths;

  return floor(widelyAvailable / monthsPerYear) - 1;
}
