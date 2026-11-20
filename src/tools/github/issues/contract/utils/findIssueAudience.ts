import { stepsSection } from "#tools/github/issues/contract/constants";
import { hasSection } from "#tools/github/issues/contract/utils/hasSection";
import type { IssueAudience } from "#tools/github/issues/contract/types/IssueAudience";
import type { IssueType } from "#tools/github/issues/contract/types/IssueType";
import type { ParsedIssueBody } from "#tools/github/issues/contract/types/ParsedIssueBody";

/**
 * Returns the agent an issue's shape calls for: a debugger for a Problem without
 * **Steps**, otherwise a worker.
 */
export function findIssueAudience(
  meaning: IssueType | undefined,
  parsed: ParsedIssueBody,
): IssueAudience {
  return meaning === "problem" && !hasSection(parsed, stepsSection)
    ? "debugger"
    : "worker";
}
