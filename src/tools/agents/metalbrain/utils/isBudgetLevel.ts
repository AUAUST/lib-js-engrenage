import { budgetLevels } from "#tools/agents/metalbrain/constants";
import type { BudgetLevel } from "#tools/agents/metalbrain/types/BudgetLevel";

export function isBudgetLevel(value: unknown): value is BudgetLevel {
  return budgetLevels.some((level) => level === value);
}
