import { countWords } from "#tools/agents/utils/countWords";
import { parseGithubCommand, parseIssueBody } from "#tools/github/index";
import type { BudgetFinding } from "#tools/agents/types/BudgetFinding";
import type { BudgetKind } from "#tools/agents/types/BudgetKind";
import type { Budgets } from "#tools/agents/types/Budgets";

const sectionKinds: Readonly<Partial<Record<string, BudgetKind>>> = {
  "Goal": "goal",
  "Context": "context",
  "Done when": "doneWhen",
};

export function measureGithubCommand(
  command: string,
  budgets: Budgets,
): BudgetFinding[] {
  const write = parseGithubCommand(command);

  if (write === undefined) {
    return [];
  }

  // @debt a body passed with `--body-file <path>` or unreadable is not read here, so the whole command's text stands in for it.
  const body = write.body?.kind === "text" ? write.body.text : command;
  const subject = `gh issue ${write.action}`;

  if (write.action === "comment") {
    const words = countWords(body);

    return words > budgets.comment
      ? [
          {
            subject,
            kind: "comment",
            words,
            budget: budgets.comment,
          },
        ]
      : [];
  }

  const findings: BudgetFinding[] = [];

  for (const { name, content } of parseIssueBody(body).sections) {
    const kind = sectionKinds[name];
    const words = countWords(content);

    if (kind !== undefined && words > budgets[kind]) {
      findings.push({
        subject: `${subject}, ${name}`,
        kind,
        words,
        budget: budgets[kind],
      });
    }
  }

  return findings;
}
