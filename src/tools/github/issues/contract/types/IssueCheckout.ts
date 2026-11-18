import type { Directory } from "#types/Directory";

export interface IssueCheckout {
  readonly repository: string;
  readonly root: Directory;
  readonly ref: string;
}
