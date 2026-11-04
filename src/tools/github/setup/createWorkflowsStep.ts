import { workflowsDirectory, workflowSets } from "#github/constants";
import { renderWorkflow } from "#github/operations/renderWorkflow";
import { resolveWorkflowSet } from "#github/utils/resolveWorkflowSet";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#cli/types/Step";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { StepContext } from "#cli/types/StepContext";
import type { File } from "#types/File";

interface MissingWorkflow {
  file: File;
  content: string;
}

function findMissingWorkflows({
  config,
  filesystem,
  getPresets,
  hasDependency,
}: StepContext): readonly MissingWorkflow[] {
  const name = resolveWorkflowSet({
    workflows: config.github.workflows,
    presets: getPresets(),
    hasDependency,
  });

  if (name === undefined) {
    return [];
  }

  const missing: MissingWorkflow[] = [];

  for (const file of workflowSets[name].files) {
    const path = `${workflowsDirectory}/${file}`;

    if (!filesystem.exists(path)) {
      missing.push({
        file: path,
        content: renderWorkflow(name, file),
      });
    }
  }

  return missing;
}

export function createWorkflowsStep(): Step {
  return {
    name: workflowsDirectory,
    message: "Add the GitHub workflows?",
    isMissing(context) {
      return findMissingWorkflows(context).length > 0;
    },
    plan(context) {
      for (const { file, content } of findMissingWorkflows(context)) {
        context.filesystem.write(file, content);
      }
    },
  };
}
