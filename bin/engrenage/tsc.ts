import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import { packages } from "#constants";
import { tsconfigEnvironments } from "#project/tsconfig/index";
import { createTsconfig } from "#project/tsconfig/utils/createTsconfig";
import { defineToolCommands } from "#workflows/cli/operations/defineToolCommands";
import { ensureAnyOf } from "#workflows/cli/operations/ensureAnyOf";
import { ensureIncludes } from "#workflows/cli/operations/ensureIncludes";
import { getOptionsEnd } from "#workflows/cli/utils/getOptionsEnd";
import { isOptionOf } from "#workflows/cli/utils/isOptionOf";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { File } from "#types/File";

const buildOptions = ["--build", "-b"];

function isSolution(config: ProjectConfig, project: File): boolean {
  const { references } = createTsconfig({
    root: config.root,
    path: project,
    filesystem: config.filesystem,
  });

  return isNotEmpty(references);
}

function hasReferencedEnvironment(config: ProjectConfig): boolean {
  return tsconfigEnvironments.some((name) => {
    const { owner, check } = config[name].tsconfig;

    return config[name].active && owner === name && check;
  });
}

function resolveDistProject(config: ProjectConfig): File {
  const { active } = config.tests;
  const { owner, file, path } = config.tests.dist.tsconfig;

  if (!active) {
    throw new Error(
      "The tests environment is inactive, so it has no dist variant",
    );
  }

  if (owner === undefined || file === undefined) {
    throw new Error(
      "The dist tsconfig is disabled in the engrenage config (tests.dist.tsconfig: false)",
    );
  }

  if (path === undefined) {
    throw new Error(
      `The dist tsconfig ${file} does not exist in ${config.root}, run \`engrenage sync\` to create it`,
    );
  }

  return path;
}

function checkProject(
  config: ProjectConfig,
  args: string[],
  project: File | undefined,
) {
  if (project === undefined) {
    throw new Error(`No tsconfig found in ${config.root}`);
  }

  const builds = args.slice(0, getOptionsEnd(args)).some((arg) => {
    return isOptionOf(arg, buildOptions);
  });

  if (!builds && isSolution(config, project)) {
    args.unshift("--build", project);
  } else if (!builds) {
    ensureAnyOf(args, ["--project", "-p"], ["--project", project]);
  }

  ensureIncludes(args, "--noEmit");
}

export const tsc = defineToolCommands({
  packageName: packages.typescript,
  binary: "tsc",
  commands: {
    "tsc": {
      aliases: "typecheck",
      description:
        "Check types of every environment the base tsconfig references (those with `check: true`).",
      message: "Typechecking...",
      arguments(config, args) {
        const project = config.typescript.tsconfig.path;

        if (!hasReferencedEnvironment(config)) {
          throw new Error(
            "No environment is referenced by the base tsconfig: every active environment has `check: false`",
          );
        }

        checkProject(config, args, project);
      },
    },
    "tsc:dist": {
      aliases: "typecheck:dist",
      description:
        "Check the types of the tests against the build output (the tests.dist tsconfig).",
      message: "Checking the types of the build output...",
      arguments(config, args) {
        checkProject(config, args, resolveDistProject(config));
      },
    },
  },
});
