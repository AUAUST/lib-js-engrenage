import { relative } from "node:path";

import { map } from "@auaust/primitive-kit/arrays";
import { hasOwn } from "@auaust/toolkit/object";

import { syncFiles } from "#foundation/blocks/index";
import { resolveWithin, toPosixPath } from "#foundation/filesystem/index";
import { workflowsDirectory, workflowSets } from "#tools/github/constants";
import { renderWorkflow } from "#tools/github/operations/renderWorkflow";
import { resolveWorkflowSet } from "#tools/github/utils/resolveWorkflowSet";
import type { OptionContext } from "#foundation/options/index";
import type { ProjectConfig } from "#project/config/index";
import type { ResolvedGit } from "#tools/git/index";
import type { ResolvedGithub } from "#tools/github/types/ResolvedGithub";
import type { WorkflowSetName } from "#tools/github/types/WorkflowSetName";

async function assertScripts(
  config: OptionContext<ProjectConfig>,
  name: WorkflowSetName,
  required: readonly string[],
) {
  const packageJson = await config.get("packageJson");

  const scripts = packageJson.optional.scripts ?? {};

  for (const script of required) {
    if (!hasOwn(scripts, script)) {
      throw new Error(
        `${await config.get("packageJsonPath")} does not declare the "${script}" script that the ${name} workflows run`,
      );
    }
  }
}

export async function syncWorkflowFiles(
  config: OptionContext<
    ProjectConfig & { git: ResolvedGit; github: ResolvedGithub }
  >,
) {
  const github = await config.get("github");
  const environment = await config.get("environment");

  const name = resolveWorkflowSet({
    workflows: github.workflows,
    traits: await config.get("traits"),
    hasDependency: environment.hasDependency,
  });

  if (name === undefined) {
    return;
  }

  const { files, scripts } = workflowSets[name];

  const { root, filesystem } = await config.get("git");

  const directory =
    toPosixPath(relative(root, await config.get("root"))) || ".";

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

  await assertScripts(config, name, scripts);

  syncFiles(
    { filesystem, resolve: (...paths) => resolveWithin(root, ...paths) },
    syncs,
  );
}
