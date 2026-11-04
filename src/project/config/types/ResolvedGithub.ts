// @debt reaches into tools/github, a higher layer than project; the layered registry (#143) removes the upward dependency
import type { WorkflowSetName } from "#github/types/WorkflowSetName";

export interface ResolvedGithub {
  readonly workflows: WorkflowSetName | false | undefined;
}
