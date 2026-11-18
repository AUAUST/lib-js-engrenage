import { splitSections } from "#foundation/markdown/index";
import { countWords } from "#tools/agents/utils/countWords";
import type { BudgetFinding } from "#tools/agents/types/BudgetFinding";
import type { BudgetKind } from "#tools/agents/types/BudgetKind";

export function getOverBudgetEntries(
  content: string,
  { kind, budget }: { kind: BudgetKind; budget: number },
): BudgetFinding[] {
  const findings: BudgetFinding[] = [];

  for (const { name, source } of splitSections(content, 2)) {
    const words = countWords(source);

    if (name !== undefined && words > budget) {
      findings.push({
        subject: name,
        kind,
        words,
        budget,
      });
    }
  }

  return findings;
}
