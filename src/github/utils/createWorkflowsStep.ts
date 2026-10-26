import { workflowsDirectory, workflowSets } from "#github/constants";
import { renderWorkflow } from "#github/utils/renderWorkflow";
import { resolveWorkflowSet } from "#github/utils/resolveWorkflowSet";
import type { Step } from "#support/scaffold/types/Step";
import type { StepContext } from "#support/scaffold/types/StepContext";
import type { File } from "#types/File";

interface MissingWorkflow {
  file: File;
  content: string;
}

function findMissingWorkflows({
  config,
  files,
  getPresets,
  hasDependency,
}: StepContext): ReadonlyArray<MissingWorkflow> {
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

    if (!files.exists(path)) {
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
        context.files.write(file, content);
      }
    },
  };
}
