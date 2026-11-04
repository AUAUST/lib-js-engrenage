import { countWords } from "#tools/agents/utils/countWords";
import { parseGithubCommand } from "#tools/agents/utils/parseGithubCommand";
import type { BudgetFinding } from "#tools/agents/types/BudgetFinding";
import type { Budgets } from "#tools/agents/types/Budgets";

export function measureGithubCommand(
  command: string,
  budgets: Budgets,
): BudgetFinding | undefined {
  const write = parseGithubCommand(command);

  if (write === undefined) {
    return;
  }

  const words = countWords(write.body);
  const budget = budgets[write.kind];

  return words > budget
    ? {
        subject: `gh issue ${write.action}`,
        kind: write.kind,
        words,
        budget,
      }
    : undefined;
}
