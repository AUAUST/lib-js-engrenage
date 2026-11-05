import { every, find } from "@auaust/primitive-kit/arrays";

import { workflowSetNames, workflowSets } from "#tools/github/constants";
import type { ResolvedTraits } from "#project/presets/index";
import type { WorkflowSetName } from "#tools/github/types/WorkflowSetName";
import type { PackageName } from "#types/PackageName";

export function resolveWorkflowSet({
  workflows,
  traits,
  hasDependency,
}: {
  workflows: WorkflowSetName | false | undefined;
  traits: ResolvedTraits;
  hasDependency(name: PackageName): boolean;
}): WorkflowSetName | undefined {
  if (workflows !== undefined) {
    return workflows === false ? undefined : workflows;
  }

  return find(workflowSetNames, (name) => {
    return (
      traits[workflowSets[name].trait] &&
      every(workflowSets[name].requires, hasDependency)
    );
  });
}
