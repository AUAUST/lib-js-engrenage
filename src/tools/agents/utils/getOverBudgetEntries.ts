import { countWords } from "#tools/agents/utils/countWords";
import type { BudgetFinding } from "#tools/agents/types/BudgetFinding";
import type { BudgetKind } from "#tools/agents/types/BudgetKind";

export function getOverBudgetEntries(
  content: string,
  { kind, budget }: { kind: BudgetKind; budget: number },
): BudgetFinding[] {
  const findings: BudgetFinding[] = [];

  for (const entry of content.split(/^(?=## )/m)) {
    const words = countWords(entry);

    if (entry.startsWith("## ") && words > budget) {
      findings.push({
        subject: entry.split("\n", 1)[0].slice(3).trim(),
        kind,
        words,
        budget,
      });
    }
  }

  return findings;
}
