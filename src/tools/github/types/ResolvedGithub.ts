import type { IssueProtocol } from "#tools/github/issues/contract/index";
import type { Label } from "#tools/github/types/Label";
import type { WorkflowSetName } from "#tools/github/types/WorkflowSetName";

/**
 * The resolved `github` config section. `workflowsConfigured` tells whether
 * `github.workflows` was set rather than defaulted, and `repositories` maps short
 * names to `owner/repo`, resolved once on first call.
 */
export interface ResolvedGithub {
  readonly workflows: WorkflowSetName | false;
  readonly testShards: number;
  readonly workflowsConfigured: boolean;
  readonly protocol: IssueProtocol;
  readonly labels: Readonly<Record<string, Label>>;
  repositories(): Promise<ReadonlyMap<string, string>>;
}
