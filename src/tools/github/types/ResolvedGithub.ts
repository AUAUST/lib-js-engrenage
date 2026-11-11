import type { IssueProtocol } from "#tools/github/issues/contract/index";
import type { WorkflowSetName } from "#tools/github/types/WorkflowSetName";

export interface ResolvedGithub {
  readonly workflows: WorkflowSetName | false;
  readonly testShards: number;
  readonly workflowsConfigured: boolean;
  readonly protocol: IssueProtocol;
  repositories(): Promise<ReadonlyMap<string, string>>;
}
