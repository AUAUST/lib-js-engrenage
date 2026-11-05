import { relative } from "node:path";

import { toPosixPath } from "#foundation/filesystem/index";
import { workflowsDirectory, workflowSets } from "#tools/github/constants";
import { renderWorkflow } from "#tools/github/operations/renderWorkflow";
import { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
import type { Environment } from "#project/config/index";
import type { Step, StepContext } from "#project/steps/index";
import type { ResolvedGit } from "#tools/git/index";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface Sections {
  root: Directory;
  environment: Environment;
  git: ResolvedGit;
  github: ResolvedGithub;
}

interface MissingWorkflow {
  file: File;
  content: string;
}

async function findMissingWorkflows({
  get,
  getTraits,
}: StepContext<Sections>): Promise<readonly MissingWorkflow[]> {
  const github = await get("github");
  const environment = await get("environment");

  const name = resolveWorkflowSet({
    workflows: github.workflows,
    traits: await getTraits(),
    hasDependency: environment.hasDependency,
  });

  if (name === undefined) {
    return [];
  }

  const { root, filesystem } = await get("git");
  const directory = relative(root, await get("root")) || ".";
  const missing: MissingWorkflow[] = [];

  for (const file of workflowSets[name].files) {
    const path = `${workflowsDirectory}/${file}`;

    if (!filesystem.exists(path)) {
      missing.push({
        file: path,
        content: renderWorkflow(name, file, toPosixPath(directory)),
      });
    }
  }

  return missing;
}

export function createWorkflowsStep(): Step<Sections> {
  return {
    name: workflowsDirectory,
    message: "Add the GitHub workflows?",
    async isMissing(context) {
      const missing = await findMissingWorkflows(context);

      return missing.length > 0;
    },
    async plan(context) {
      for (const { file, content } of await findMissingWorkflows(context)) {
        const git = await context.get("git");

        git.filesystem.write(file, content);
      }
    },
  };
}
