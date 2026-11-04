import type { BudgetFinding } from "#tools/agents/types/BudgetFinding";

export function formatBudgetFinding({
  subject,
  kind,
  words,
  budget,
}: BudgetFinding): string {
  return `${subject}: ${words} words, over the ${kind} budget of ${budget}. Link to where the detail lives or split it; never truncate decisions.`;
}
