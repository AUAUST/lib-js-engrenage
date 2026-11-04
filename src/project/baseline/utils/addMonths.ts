import { floor } from "@auaust/toolkit/math";

import { monthsPerYear } from "#project/baseline/constants";

// @debt the day is kept as is, so the result can be an impossible date such as 2026-02-31; it only compares correctly as a string.
export function addMonths(date: string, months: number): string {
  const [year = 0, month = 1, day = ""] = date.split("-");
  const index = Number(year) * monthsPerYear + Number(month) - 1 + months;

  const newYear = String(floor(index / monthsPerYear)).padStart(4, "0");
  const newMonth = String((index % monthsPerYear) + 1).padStart(2, "0");

  return `${newYear}-${newMonth}-${day}`;
}
