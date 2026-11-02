import { floor } from "@auaust/toolkit/math";

import { typescriptBaselineLibrary } from "#constants";
import {
  baselineWidelyAvailableMonths,
  monthsPerYear,
} from "#typescript/constants";
import { findCurrentMonth } from "#typescript/utils/findCurrentMonth";
import { listBaselineYears } from "#typescript/utils/listBaselineYears";
import { toBaselineYear } from "#typescript/utils/toBaselineYear";

function toSnapshot(year: number): string {
  const months = (year + 1) * monthsPerYear + baselineWidelyAvailableMonths;

  const snapshotYear = floor(months / monthsPerYear);
  const snapshotMonth = (months % monthsPerYear) + 1;

  return `${snapshotYear}-${String(snapshotMonth).padStart(2, "0")}`;
}

export function resolveBaselineLibrary(snapshot: string): string {
  const current = findCurrentMonth();

  if (snapshot > current) {
    throw new Error(
      `src.baseline ${snapshot} is after the current month ${current}`,
    );
  }

  const year = toBaselineYear(snapshot);
  const years = listBaselineYears();
  const [oldest] = years;
  const newest = years.at(-1);

  if (oldest === undefined || newest === undefined) {
    throw new Error(`${typescriptBaselineLibrary} ships no year entry`);
  }

  if (year < oldest) {
    throw new Error(
      `src.baseline ${snapshot} predates the oldest entry of ${typescriptBaselineLibrary}. Earliest accepted snapshot: ${toSnapshot(oldest)}`,
    );
  }

  if (year > newest) {
    throw new Error(
      `src.baseline ${snapshot} needs ${typescriptBaselineLibrary}/year/${year}, which the installed version lacks (newest: year/${newest}). Update ${typescriptBaselineLibrary}`,
    );
  }

  return `${typescriptBaselineLibrary}/year/${year}`;
}
