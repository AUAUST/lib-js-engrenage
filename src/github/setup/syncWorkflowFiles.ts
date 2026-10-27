import { existsSync } from "node:fs";

import { map } from "@auaust/primitive-kit/arrays";
import { hasOwn } from "@auaust/toolkit/object";

import { workflowsDirectory, workflowSets } from "#github/constants";
import { renderWorkflow } from "#github/utils/renderWorkflow";
import { resolveWorkflowSet } from "#github/utils/resolveWorkflowSet";
import { syncFiles } from "#utils/syncFiles";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { WorkflowSetName } from "#github/types/WorkflowSetName";
import type { SyncResults } from "#types/SyncResults";

function assertScripts(
  config: ResolvedConfig,
  name: WorkflowSetName,
  required: ReadonlyArray<string>,
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

export function syncWorkflowFiles({
  config,
  check = false,
}: {
  config: ResolvedConfig;
  check?: boolean;
}): SyncResults {
  const name = resolveWorkflowSet({
    workflows: config.github.workflows,
    presets: config.presets,
    hasDependency: config.environment.hasDependency,
  });

  if (name === undefined) {
    return [];
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

  if (!syncs.some(({ file }) => existsSync(config.resolve(file)))) {
    return [];
  }

  assertScripts(config, name, scripts);

  return syncFiles({
    root: config.root,
    files: syncs,
    check,
  });
}
