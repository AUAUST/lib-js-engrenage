import { hasOwn } from "@auaust/toolkit/object";

import { syncFiles } from "#foundation/blocks/index";
import { resolveWithin } from "#foundation/filesystem/index";
import { workflowSets } from "#tools/github/constants";
import { renderWorkflowSet } from "#tools/github/operations/renderWorkflowSet";
import type { LoadedConfig } from "#project/config/index";
import type { WorkflowSetName } from "#tools/github/types/WorkflowSetName";

async function assertScripts(
  config: LoadedConfig,
  name: WorkflowSetName,
  required: readonly string[],
) {
  const packageJson = await config.resolve("packageJson");

  const scripts = packageJson.optional.scripts ?? {};

  for (const script of required) {
    if (!hasOwn(scripts, script)) {
      throw new Error(
        `${await config.resolve("packageJsonPath")} does not declare the "${script}" script that the ${name} workflows run`,
      );
    }
  }
}

/**
 * Rewrites the existing workflow files of the configured set, creating none.
 * Does nothing when `github.workflows` is `false` or no file of the set exists;
 * throws when `package.json` lacks a script the workflows run.
 */
export async function syncWorkflowFiles(config: LoadedConfig) {
  const { workflows: name } = await config.resolve("github");

  if (name === false) {
    return;
  }

  const { root, filesystem } = await config.resolve("git");

  const workflows = await renderWorkflowSet(config, name);

  const syncs = workflows.map(({ file, content }) => {
    return {
      file,
      update() {
        return content;
      },
    };
  });

  const exist = await Promise.all(
    syncs.map(({ file }) => filesystem.exists(file)),
  );

  if (!exist.some(Boolean)) {
    return;
  }

  await assertScripts(config, name, workflowSets[name].scripts);

  await syncFiles(
    {
      filesystem,
      resolve: (...paths) => resolveWithin(root, ...paths),
    },
    syncs,
  );
}
