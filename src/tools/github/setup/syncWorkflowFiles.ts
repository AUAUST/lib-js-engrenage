import { relative } from "node:path";

import { map } from "@auaust/primitive-kit/arrays";
import { hasOwn } from "@auaust/toolkit/object";

import { syncFiles } from "#foundation/blocks/index";
import { resolveWithin, toPosixPath } from "#foundation/filesystem/index";
import { workflowsDirectory, workflowSets } from "#tools/github/constants";
import { renderWorkflow } from "#tools/github/operations/renderWorkflow";
import { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
import type { ProjectConfig } from "#project/config/index";
import type { ResolvedGit } from "#tools/git/index";
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
  config: ProjectConfig & { git: ResolvedGit; github: ResolvedGithub },
) {
  const name = resolveWorkflowSet({
    workflows: config.github.workflows,
    traits: config.traits,
    hasDependency: config.environment.hasDependency,
  });

  if (name === undefined) {
    return;
  }

  const { files, scripts } = workflowSets[name];

  const { root, filesystem } = config.git;
  const directory = toPosixPath(relative(root, config.root)) || ".";

  const syncs = map(files, (file) => {
    const content = renderWorkflow(name, file, directory);

    return {
      file: `${workflowsDirectory}/${file}`,
      update() {
        return content;
      },
    };
  });

  if (!syncs.some(({ file }) => filesystem.exists(file))) {
    return;
  }

  assertScripts(config, name, scripts);

  syncFiles(
    { filesystem, resolve: (...paths) => resolveWithin(root, ...paths) },
    syncs,
  );
}
