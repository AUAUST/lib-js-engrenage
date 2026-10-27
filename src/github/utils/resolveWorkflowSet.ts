import { every, find, includes } from "@auaust/primitive-kit/arrays";

import { workflowSetNames, workflowSets } from "#github/constants";
import type { Presets } from "#config/types/Presets";
import type { WorkflowSetName } from "#github/types/WorkflowSetName";
import type { PackageName } from "#types/PackageName";

export function resolveWorkflowSet({
  workflows,
  presets,
  hasDependency,
}: {
  workflows: WorkflowSetName | false | undefined;
  presets: Presets;
  hasDependency(name: PackageName): boolean;
}): WorkflowSetName | undefined {
  if (workflows !== undefined) {
    return workflows === false ? undefined : workflows;
  }

  return find(workflowSetNames, (name) => {
    return (
      includes(presets, name) &&
      every(workflowSets[name].requires, hasDependency)
    );
  });
}
