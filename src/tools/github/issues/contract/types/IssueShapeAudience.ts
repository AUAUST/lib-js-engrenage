import type { IssueAudience } from "#tools/github/issues/contract/types/IssueAudience";

export type IssueShapeAudience =
  | IssueAudience
  | "orchestrator"
  | "verification";
