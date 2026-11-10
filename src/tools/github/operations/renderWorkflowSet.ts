import { relative } from "node:path";

import { toPosixPath } from "#foundation/filesystem/index";
import { workflowsDirectory, workflowSets } from "#tools/github/constants";
import { renderWorkflow } from "#tools/github/operations/renderWorkflow";
import type { LoadedConfig } from "#project/config/index";
import type { WorkflowSetName } from "#tools/github/types/WorkflowSetName";
import type { File } from "#types/File";

interface RenderedWorkflow {
  file: File;
  content: string;
}

export async function renderWorkflowSet(
  config: LoadedConfig,
  name: WorkflowSetName,
): Promise<readonly RenderedWorkflow[]> {
  const [
    { root },
    { testShards },
  ] = await Promise.all([config.resolve("git"), config.resolve("github")]);

  const directory = toPosixPath(relative(root, config.context.root)) || ".";

  return Promise.all(
    workflowSets[name].files.map(async (file) => {
      return {
        file: `${workflowsDirectory}/${file}`,
        content: await renderWorkflow(name, file, {
          directory,
          testShards,
        }),
      };
    }),
  );
}
