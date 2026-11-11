import type { GithubSnapshot } from "#tools/github/issues/api/index";
import type { IssueProtocol } from "#tools/github/issues/contract/index";

export interface DraftsContext {
  readonly snapshot: GithubSnapshot;
  readonly repository: string;
  readonly protocol: IssueProtocol;
}
