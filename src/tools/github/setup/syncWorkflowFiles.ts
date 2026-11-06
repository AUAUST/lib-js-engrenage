import { relative } from "node:path";

import { map } from "@auaust/primitive-kit/arrays";
import { hasOwn } from "@auaust/toolkit/object";

import { syncFiles } from "#foundation/blocks/index";
import { resolveWithin, toPosixPath } from "#foundation/filesystem/index";
import {
  environmentSection,
  packageJsonPathSection,
  packageJsonSection,
  traitsSection,
  type LoadedConfig,
} from "#project/config/index";
import { gitSection } from "#tools/git/index";
import { githubSection } from "#tools/github/config/githubSection";
import { workflowsDirectory, workflowSets } from "#tools/github/constants";
import { renderWorkflow } from "#tools/github/operations/renderWorkflow";
import { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
import type { WorkflowSetName } from "#tools/github/types/WorkflowSetName";

async function assertScripts(
  config: LoadedConfig,
  name: WorkflowSetName,
  required: readonly string[],
) {
  const packageJson = await config.resolve(packageJsonSection);

  const scripts = packageJson.optional.scripts ?? {};

  for (const script of required) {
    if (!hasOwn(scripts, script)) {
      throw new Error(
        `${await config.resolve(packageJsonPathSection)} does not declare the "${script}" script that the ${name} workflows run`,
      );
    }
  }
}

export async function syncWorkflowFiles(config: LoadedConfig) {
  const github = await config.resolve(githubSection);
  const environment = await config.resolve(environmentSection);

  const name = resolveWorkflowSet({
    workflows: github.workflows,
    traits: await config.resolve(traitsSection),
    hasDependency: environment.hasDependency,
  });

  if (name === undefined) {
    return;
  }

  const { files, scripts } = workflowSets[name];

  const { root, filesystem } = await config.resolve(gitSection);

  const directory = toPosixPath(relative(root, config.context.root)) || ".";

  const syncs = await Promise.all(
    map(files, async (file) => {
      const content = await renderWorkflow(name, file, directory);

      return {
        file: `${workflowsDirectory}/${file}`,
        update() {
          return content;
        },
      };
    }),
  );

  const exist = await Promise.all(
    syncs.map(({ file }) => filesystem.exists(file)),
  );

  if (!exist.some(Boolean)) {
    return;
  }

  await assertScripts(config, name, scripts);

  await syncFiles(
    { filesystem, resolve: (...paths) => resolveWithin(root, ...paths) },
    syncs,
  );
}
