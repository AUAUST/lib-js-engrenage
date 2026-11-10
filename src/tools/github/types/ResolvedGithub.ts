import type { WorkflowSetName } from "#tools/github/types/WorkflowSetName";

export interface ResolvedGithub {
  readonly workflows: WorkflowSetName | false;
  readonly testShards: number;
  readonly workflowsConfigured: boolean;
}
