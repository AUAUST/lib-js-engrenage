import { map } from "@auaust/primitive-kit/arrays";
import { hasOwn } from "@auaust/toolkit/object";

import { syncFiles } from "#foundation/blocks/operations/syncFiles";
import { workflowsDirectory, workflowSets } from "#tools/github/constants";
import { renderWorkflow } from "#tools/github/operations/renderWorkflow";
import { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";
import type { WorkflowSetName } from "#tools/github/types/WorkflowSetName";

function assertScripts(
  config: ProjectConfig,
  name: WorkflowSetName,
  required: readonly string[],
) {
  const scripts = config.packageJson.optional.scripts ?? {};

  for (const script of required) {
    if (!hasOwn(scripts, script)) {
      throw new Error(
        `${config.packageJsonPath} does not declare the "${script}" script that the ${name} workflows run`,
      );
    }
  }
}

export function syncWorkflowFiles(
  config: ProjectConfig & { github: ResolvedGithub },
) {
  const name = resolveWorkflowSet({
    workflows: config.github.workflows,
    presets: config.presets,
    hasDependency: config.environment.hasDependency,
  });

  if (name === undefined) {
    return;
  }

  const { files, scripts } = workflowSets[name];

  const syncs = map(files, (file) => {
    const content = renderWorkflow(name, file);

    return {
      file: `${workflowsDirectory}/${file}`,
      update() {
        return content;
      },
    };
  });

  if (!syncs.some(({ file }) => config.filesystem.exists(file))) {
    return;
  }

  assertScripts(config, name, scripts);

  syncFiles(config, syncs);
}
