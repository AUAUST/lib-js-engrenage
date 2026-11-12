import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

export function hasSection(parsed: ParsedIssueBody, name: string) {
  return parsed.sections.some((section) => section.name === name);
}
