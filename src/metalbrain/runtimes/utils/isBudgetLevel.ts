import { budgetLevels } from "#metalbrain/runtimes/constants";
import type { BudgetLevel } from "#metalbrain/runtimes/types/BudgetLevel";

export function isBudgetLevel(value: unknown): value is BudgetLevel {
  return budgetLevels.some((level) => level === value);
}
