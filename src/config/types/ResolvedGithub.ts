import type { WorkflowSetName } from "#github/types/WorkflowSetName";

export interface ResolvedGithub {
  readonly workflows: WorkflowSetName | false | undefined;
}
