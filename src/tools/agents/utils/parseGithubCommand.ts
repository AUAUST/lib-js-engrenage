import type { BudgetKind } from "#tools/agents/types/BudgetKind";
import type { GithubWrite } from "#tools/agents/types/GithubWrite";

const commandPattern = /\bgh\s+issue\s+(create|edit|comment)\b/;

const heredocPattern =
  /<<-?\s*(['"]?)(\w+)\1[^\n]*\n([\s\S]*?)\n[ \t]*\2[ \t]*(?:\n|$)/;

const titlePattern = /(?:--title|\s-t)[\s=]+(?:"([^"]*)"|'([^']*)'|(\S+))/;

function getKind(action: GithubWrite["action"], title: string | undefined) {
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

export function parseGithubCommand(command: string): GithubWrite | undefined {
  const action = commandPattern.exec(command)?.[1] as
    GithubWrite["action"] | undefined;

  if (action === undefined) {
    return;
  }

  const heredoc = heredocPattern.exec(command);
  const rest = heredoc === null ? command : command.replace(heredoc[0], "");
  const match = titlePattern.exec(rest);
  const title = match?.[1] ?? match?.[2] ?? match?.[3];

  return {
    action,
    kind: getKind(action, title),
    // @debt without a heredoc (`--body "…"`, `--body-file <path>`) the body is not parsed and the whole command's length stands in for it.
    body: heredoc?.[3] ?? command,
  };
}
