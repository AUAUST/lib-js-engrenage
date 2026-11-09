import { relative } from "node:path";

import { toPosixPath } from "#foundation/filesystem/index";
import { workflowsDirectory, workflowSets } from "#tools/github/constants";
import { renderWorkflow } from "#tools/github/operations/renderWorkflow";
import { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
import type { Step, StepContext } from "#project/steps/index";
import type { File } from "#types/File";

interface MissingWorkflow {
  file: File;
  content: string;
}

async function findMissingWorkflows({
  resolve,
  context,
  getTraits,
}: StepContext): Promise<readonly MissingWorkflow[]> {
  const github = await resolve("github");

  const { hasDependency } = await resolve("environment");

  const name = github.workflowsConfigured
    ? github.workflows
    : resolveWorkflowSet({
        traits: await getTraits(),
        hasDependency,
      });

  if (name === false) {
    return [];
  }

  const { root, filesystem } = await resolve("git");

  const directory = relative(root, context.root) || ".";
  const missing: MissingWorkflow[] = [];

  await Promise.all(
    workflowSets[name].files.map(async (file) => {
      const path = `${workflowsDirectory}/${file}`;

      if (!(await filesystem.exists(path))) {
        missing.push({
          file: path,
          content: await renderWorkflow(name, file, toPosixPath(directory)),
        });
      }
    }),
  );

  return missing;
}

export function createWorkflowsStep(): Step {
  return {
    name: workflowsDirectory,
    message: "Add the GitHub workflows?",
    async isMissing(context) {
      const missing = await findMissingWorkflows(context);

      return missing.length > 0;
    },
    async plan(context) {
      for (const { file, content } of await findMissingWorkflows(context)) {
        const git = await context.resolve("git");

        await git.filesystem.write(file, content);
      }
    },
  };
}
