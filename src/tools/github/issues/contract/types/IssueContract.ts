import type { IssueShape } from "#tools/github/issues/contract/types/IssueShape";

export interface IssueContract {
  readonly sections: readonly string[];
  readonly shapes: readonly IssueShape[];
  readonly hints?: Readonly<Record<string, string>>;
  readonly modelsAfter?: string;
  readonly hasHeader: boolean;
  readonly generated?: readonly string[];
  readonly subIssues: "roadmap" | "references";
}
