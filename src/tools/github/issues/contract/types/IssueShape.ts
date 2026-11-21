import type { IssueShapeAudience } from "#tools/github/issues/contract/types/IssueShapeAudience";

export interface IssueShape {
  readonly summary: string;
  readonly audience: IssueShapeAudience;
  readonly when?: {
    readonly subIssues?: boolean;
    readonly section?: string;
  };
  readonly required: readonly string[];
  readonly draftRequired?: readonly string[];
  readonly forbidden?: Readonly<Record<string, string>>;
}
