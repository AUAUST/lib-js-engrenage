import type { IssueLocation } from "#tools/github/issues/contract/types/IssueLocation";
import type { IssueShapeAudience } from "#tools/github/issues/contract/types/IssueShapeAudience";

export interface ReadyIssue extends IssueLocation {
  readonly audience: IssueShapeAudience;
}
