import { isNotEmpty } from "@auaust/primitive-kit/arrays";

import { packages } from "#constants";
import { tsconfigEnvironments } from "#project/tsconfig/index";
import { createTsconfig } from "#project/tsconfig/utils/createTsconfig";
import { defineToolCommands } from "#workflows/cli/operations/defineToolCommands";
import { ensureAnyOf } from "#workflows/cli/operations/ensureAnyOf";
import { ensureIncludes } from "#workflows/cli/operations/ensureIncludes";
import { getOptionsEnd } from "#workflows/cli/utils/getOptionsEnd";
import { isOptionOf } from "#workflows/cli/utils/isOptionOf";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { File } from "#types/File";

const buildOptions = ["--build", "-b"];

async function isSolution(
  config: ConfigContext,
  project: File,
): Promise<boolean> {
  const { references } = createTsconfig({
    root: await config.get("root"),
    path: project,
    filesystem: await config.get("filesystem"),
  });

  return isNotEmpty(references);
}

async function hasReferencedEnvironment(
  config: ConfigContext,
): Promise<boolean> {
  for (const name of tsconfigEnvironments) {
    const { active, tsconfig } = await config.get(name);
    const { owner, check } = tsconfig;

    if (active && owner === name && check) {
      return true;
    }
  }

  return false;
}

async function resolveDistProject(config: ConfigContext): Promise<File> {
  const { active } = await config.get("tests");
  const tests = await config.get("tests");

  const { owner, file, path } = tests.dist.tsconfig;

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
      `The dist tsconfig ${file} does not exist in ${await config.get("root")}, run \`engrenage sync\` to create it`,
    );
  }

  return path;
}

async function checkProject(
  config: ConfigContext,
  args: string[],
  project: File | undefined,
) {
  if (project === undefined) {
    throw new Error(`No tsconfig found in ${await config.get("root")}`);
  }

  const builds = args.slice(0, getOptionsEnd(args)).some((arg) => {
    return isOptionOf(arg, buildOptions);
  });

  if (!builds && (await isSolution(config, project))) {
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
      message: "Typechecking...",
      async arguments(config, args) {
        const typescript = await config.get("typescript");

        const project = await typescript.tsconfig.path;

        if (!(await hasReferencedEnvironment(config))) {
          throw new Error(
            "No environment is referenced by the base tsconfig: every active environment has `check: false`",
          );
        }

        await checkProject(config, args, project);
      },
    },
    "tsc:dist": {
      message: "Checking the types of the build output...",
      async arguments(config, args) {
        await checkProject(config, args, await resolveDistProject(config));
      },
    },
  },
});
