import type { IssueAudience } from "#tools/github/issues/contract/types/IssueAudience";
import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";

export interface ReadyIssue extends IssueLocation {
  readonly audience: IssueAudience | "orchestrator";
}
