import { typescript } from "#constants";
import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import { ensureAnyOf } from "#support/commander/utils/ensureAnyOf";
import { ensureIncludes } from "#support/commander/utils/ensureIncludes";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";

function checkProject(
  config: ResolvedConfig,
  args: string[],
  project: File | undefined,
) {
  if (project === undefined) {
    throw new Error(`No tsconfig found in ${config.root}`);
  }

  ensureIncludes(args, "--noEmit");
  ensureAnyOf(args, ["--project", "-p"], ["--project", project]);
}

export default defineToolCommands({
  packageName: typescript,
  binary: "tsc",
  commands: {
    "tsc": {
      description: "Check types with the project tsconfig.",
      message: "Checking types...",
      aliases: "typecheck",
      arguments(config, args) {
        checkProject(config, args, config.tsconfigPath);
      },
    },
    "tsc:dist": {
      description: "Check types with the dist tsconfig.",
      message: "Checking the types of the build output...",
      aliases: "typecheck:dist",
      arguments(config, args) {
        checkProject(config, args, config.distTsconfigPath);
      },
    },
  },
});
