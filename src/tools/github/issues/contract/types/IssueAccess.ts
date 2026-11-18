import type { GithubAccess } from "#tools/github/issues/api/index";
import type { ContractNames } from "#tools/github/issues/contract/types/ContractNames";

export interface IssueAccess extends GithubAccess {
  readonly contractNames: ContractNames;
}
