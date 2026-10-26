import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";

function checkProject(
  config: ResolvedConfig,
  project: File | undefined,
): readonly string[] {
  if (project === undefined) {
    throw new Error(`No tsconfig found in ${config.root}`);
  }

  return ["--noEmit", "--project", project];
}

export default defineToolCommands({
  packageName: "typescript",
  binary: "tsc",
  commands: {
    "tsc": {
      description: "Check types with the project tsconfig.",
      arguments(config) {
        return checkProject(config, config.tsconfigPath);
      },
    },
    "tsc:dist": {
      description: "Check types with the dist tsconfig.",
      arguments(config) {
        return checkProject(config, config.distTsconfigPath);
      },
    },
  },
});
