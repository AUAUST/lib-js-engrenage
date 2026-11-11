import type { GithubAccess } from "#tools/github/issues/api/index";
import type { IssueProtocol } from "#tools/github/issues/contract/types/IssueProtocol";

export interface IssueAccess extends GithubAccess {
  readonly protocol: IssueProtocol;
}
