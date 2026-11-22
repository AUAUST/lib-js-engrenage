import { getDotPath, type BaseIssue } from "valibot";

// @debt the unknown-key message and the dot-path issue lines repeat what `validate` in `foundation/options` and `checkDrafts` in `tools/github` each build their own way; one valibot issue formatter would serve all three
/**
 * One line per issue, `<subject>: <path>: <message>`, the path dropped when
 * the issue has none.
 */
export function formatSchemaIssues(
  subject: string,
  issues: readonly BaseIssue<unknown>[],
): string[] {
  return issues.map((issue) => {
    const path = getDotPath(issue);

    return path === null
      ? `${subject}: ${issue.message}`
      : `${subject}: ${path}: ${issue.message}`;
  });
}
