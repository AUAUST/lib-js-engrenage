import { every, find } from "@auaust/primitive-kit/arrays";

import { workflowSetNames, workflowSets } from "#tools/github/constants";
import type { ResolvedTraits } from "#project/presets/index";
import type { WorkflowSetName } from "#tools/github/types/WorkflowSetName";
import type { PackageName } from "#types/PackageName";

export function resolveWorkflowSet({
  traits,
  hasDependency,
}: {
  traits: ResolvedTraits;
  hasDependency(name: PackageName): boolean;
}): WorkflowSetName | false {
  return (
    find(workflowSetNames, (name) => {
      return (
        traits[workflowSets[name].trait] &&
        every(workflowSets[name].requires, hasDependency)
      );
    }) ?? false
  );
}
