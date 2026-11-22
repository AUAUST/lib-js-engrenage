import { isFiniteNumber } from "#metalbrain/runtimes/utils/isFiniteNumber";
import { isRecord } from "#metalbrain/runtimes/utils/isRecord";
import type { BudgetLevel } from "#metalbrain/runtimes/types/BudgetLevel";
import type { Budgets } from "#metalbrain/runtimes/types/Budgets";

function fail(path: string, expected: string): never {
  throw new Error(`Budgets: ${path} must be ${expected}`);
}

/**
 * Reads the budgets file, failing unless it gives each budget level a
 * positive token count.
 */
export function parseBudgets(value: unknown): Budgets {
  if (!isRecord(value)) {
    fail("the file", "an object");
  }

  const levels = isRecord(value.levels)
    ? value.levels
    : fail("levels", "an object");

  function read(level: BudgetLevel): number {
    const budget = levels[level];

    return isFiniteNumber(budget) && budget > 0
      ? budget
      : fail(`levels.${level}`, "a positive number");
  }

  return {
    levels: { scoped: read("scoped"), standard: read("standard") },
  };
}
