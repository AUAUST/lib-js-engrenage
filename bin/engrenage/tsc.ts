import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import { typescript } from "#constants";
import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import { ensureAnyOf } from "#support/commander/utils/ensureAnyOf";
import { ensureIncludes } from "#support/commander/utils/ensureIncludes";
import { getOptionsEnd } from "#support/commander/utils/getOptionsEnd";
import { isOptionOf } from "#support/commander/utils/isOptionOf";
import { createTsconfig } from "#typescript/utils/createTsconfig";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";

const buildOptions = ["--build", "-b"];

function isSolution(config: ResolvedConfig, project: File): boolean {
  const { references } = createTsconfig({
    root: config.root,
    path: project,
    filesystem: config.filesystem,
  });

  return isNotEmpty(references);
}

function checkProject(
  config: ResolvedConfig,
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

export default defineToolCommands({
  packageName: typescript,
  binary: "tsc",
  commands: {
    "tsc": {
      aliases: "typecheck",
      description:
        "Check types with the project tsconfig, building its references when it has any.",
      message: "Typechecking...",
      arguments(config, args) {
        checkProject(config, args, config.typescript.tsconfig);
      },
    },
    "tsc:dist": {
      aliases: "typecheck:dist",
      description: "Check types with the dist tsconfig.",
      message: "Checking the types of the build output...",
      arguments(config, args) {
        checkProject(config, args, config.typescript.distTsconfig);
      },
    },
  },
});
