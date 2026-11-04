import { workflowsDirectory, workflowSets } from "#tools/github/constants";
import { renderWorkflow } from "#tools/github/operations/renderWorkflow";
import { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { Step } from "#workflows/cli/types/Step";
// @debt reaches into workflows/cli, a higher layer than tools; the layered registry (#143) removes the upward dependency
import type { File } from "#types/File";
import type { StepContext } from "#workflows/cli/types/StepContext";

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
