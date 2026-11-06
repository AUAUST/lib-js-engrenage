import { countWords } from "#tools/agents/utils/countWords";
import { parseGithubCommand } from "#tools/github/index";
import type { BudgetFinding } from "#tools/agents/types/BudgetFinding";
import type { BudgetKind } from "#tools/agents/types/BudgetKind";
import type { Budgets } from "#tools/agents/types/Budgets";

// @debt the kind comes from `Plan:`/`Block:` title prefixes, which the #239 protocol drops for issue types, so every unprefixed plan or segment is measured against the task budget.
function getKind(action: "create" | "edit" | "comment", title?: string) {
  if (action === "comment") {
    return "comment" satisfies BudgetKind;
  }

  if (title?.startsWith("Plan:") === true) {
    return "plan" satisfies BudgetKind;
  }

  if (title?.startsWith("Block:") === true) {
    return "block" satisfies BudgetKind;
  }

  // @debt an edit without --title cannot tell the issue's kind from the command; it takes the loosest budget (plan) so it never warns wrongly, which lets an oversized task edit pass. Reading the issue through `gh` would classify it.
  return action === "edit" && title === undefined
    ? ("plan" satisfies BudgetKind)
    : ("task" satisfies BudgetKind);
}

export function measureGithubCommand(
  command: string,
  budgets: Budgets,
): BudgetFinding | undefined {
  const write = parseGithubCommand(command);

  if (write === undefined) {
    return;
  }

  // @debt a body passed with `--body-file <path>` or unreadable is not read here, so the whole command's length stands in for it.
  const body = write.body?.kind === "text" ? write.body.text : command;
  const kind = getKind(write.action, write.title);
  const words = countWords(body);
  const budget = budgets[kind];

  return words > budget
    ? {
        subject: `gh issue ${write.action}`,
        kind,
        words,
        budget,
      }
    : undefined;
}
