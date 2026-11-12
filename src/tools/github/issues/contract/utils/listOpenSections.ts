import {
  planningSection,
  questionsSection,
} from "#tools/github/issues/contract/constants";
import { hasSection } from "#tools/github/issues/contract/utils/hasSection";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

export function listOpenSections(parsed: ParsedIssueBody): string[] {
  return [planningSection, questionsSection].filter((name) => {
    return hasSection(parsed, name);
  });
}
