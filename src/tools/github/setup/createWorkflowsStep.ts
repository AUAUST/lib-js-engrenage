import { workflowsDirectory } from "#tools/github/constants";
import { renderWorkflowSet } from "#tools/github/operations/renderWorkflowSet";
import { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
import type { Step, StepContext } from "#project/steps/index";
import type { File } from "#types/File";

interface MissingWorkflow {
  file: File;
  content: string;
}

async function findMissingWorkflows(
  context: StepContext,
): Promise<readonly MissingWorkflow[]> {
  const github = await context.resolve("github");

  const { hasDependency } = await context.resolve("environment");

  const name = github.workflowsConfigured
    ? github.workflows
    : resolveWorkflowSet({
        traits: await context.getTraits(),
        hasDependency,
      });

  if (name === false) {
    return [];
  }

  const { filesystem } = await context.resolve("git");

  const workflows = await renderWorkflowSet(context, name);

  const exist = await Promise.all(
    workflows.map(({ file }) => filesystem.exists(file)),
  );

  return workflows.filter((_, index) => !exist[index]);
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
