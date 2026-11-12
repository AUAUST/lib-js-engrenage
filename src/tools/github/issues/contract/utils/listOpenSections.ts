import {
  planningSection,
  questionsSection,
} from "#tools/github/issues/contract/constants";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

export function listOpenSections(parsed: ParsedIssueBody): string[] {
  return [planningSection, questionsSection].filter((name) => {
    return parsed.sections.some((section) => section.name === name);
  });
}
