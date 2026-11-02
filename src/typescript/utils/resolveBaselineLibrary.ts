import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

import { filter, map, sort } from "@auaust/primitive-kit/arrays";
import { floor } from "@auaust/toolkit/math";

import { typescriptBaselineLibrary } from "#constants";
import { baselineWidelyAvailableMonths } from "#typescript/constants";
import { findCurrentMonth } from "#typescript/utils/findCurrentMonth";

const monthsPerYear = 12;

function listYears(): number[] {
  const library = dirname(
    createRequire(import.meta.url).resolve(
      `${typescriptBaselineLibrary}/package.json`,
    ),
  );

  return sort(
    map(
      filter(readdirSync(join(library, "year")), (name) =>
        /^\d{4}$/.test(name),
      ),
      Number,
    ),
    (a, b) => a - b,
  );
}

function toYear(snapshot: string): number {
  const [year = 0, month = 0] = snapshot.split("-").map(Number);

  const widelyAvailable =
    year * monthsPerYear + month - 1 - baselineWidelyAvailableMonths;

  return floor(widelyAvailable / monthsPerYear) - 1;
}

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

  const year = toYear(snapshot);
  const years = listYears();
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
