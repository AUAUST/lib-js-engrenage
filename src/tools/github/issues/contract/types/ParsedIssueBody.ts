import type { IssueListItem } from "#tools/github/issues/contract/types/IssueListItem";

// @debt A plain `#<n>` entry carries `repository: undefined`, leaving each caller to substitute the issue's own repository; parsing against a base repository would make every entry carry it.
export interface ParsedIssueBody {
  readonly header?:
    | {
        readonly ancestors: readonly {
          readonly repository: string | undefined;
          readonly number: number;
        }[];
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
  readonly roadmap: readonly {
    readonly repository: string | undefined;
    readonly number: number;
    readonly gist: string;
    readonly sections: readonly string[];
  }[];
  readonly references: readonly number[];
}
