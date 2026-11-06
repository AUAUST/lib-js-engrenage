import type { IssueListItem } from "#tools/github/types/IssueListItem";

export interface ParsedIssueBody {
  readonly header?:
    | {
        readonly ancestors: readonly number[];
        readonly sections: readonly string[];
      }
    | undefined;
  readonly sections: readonly {
    readonly name: string;
    readonly content: string;
  }[];
  readonly steps?:
    | {
        readonly numbered: boolean;
        readonly items: readonly IssueListItem[];
      }
    | undefined;
  readonly roadmap: readonly number[];
  readonly references: readonly number[];
}
