import { workflowsDirectory, workflowSets } from "#tools/github/constants";
import { renderWorkflow } from "#tools/github/operations/renderWorkflow";
import { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
import type { Step } from "#project/steps/types/Step";
import type { StepContext } from "#project/steps/types/StepContext";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";
import type { File } from "#types/File";

interface Sections {
  github: ResolvedGithub;
}

interface MissingWorkflow {
  file: File;
  content: string;
}

function findMissingWorkflows({
  get,
  filesystem,
  getTraits,
  hasDependency,
}: StepContext<Sections>): readonly MissingWorkflow[] {
  const name = resolveWorkflowSet({
    workflows: get("github").workflows,
    traits: getTraits(),
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

export function createWorkflowsStep(): Step<Sections> {
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
