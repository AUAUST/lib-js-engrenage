import { existsSync } from "node:fs";

import { packages } from "#constants";
import { resolve } from "#foundation/filesystem/utils/resolve";
import { defaultSuppressionsFile } from "#tools/eslint/constants";
import { defineToolCommands } from "#workflows/cli/operations/defineToolCommands";
import { ensureAnyOf } from "#workflows/cli/operations/ensureAnyOf";
import { ensureIncludes } from "#workflows/cli/operations/ensureIncludes";
import { hasOption } from "#workflows/cli/utils/hasOption";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";

// @debt The cache is keyed on each file alone, so type-aware rules keep passing a file whose imported types changed; checks must pass `--no-cache` to be sound.
function useCache(config: ProjectConfig, args: string[]) {
  if (hasOption(args, ["--no-cache"])) {
    return;
  }

  ensureIncludes(args, "--cache");

  ensureIncludes(args, ["--cache-location", config.cacheFor(packages.eslint)]);
}

function hasSuppressions(args: readonly string[]): boolean {
  return (
    hasOption(args, ["--suppressions-location"]) ||
    existsSync(resolve(process.cwd(), defaultSuppressionsFile))
  );
}

export const eslint = defineToolCommands({
  packageName: packages.eslint,
  commands: {
    "eslint": {
      description: "Lint the project, caching results in node_modules.",
      message: "Linting...",
      aliases: "lint",
      arguments(config, args) {
        useCache(config, args);
      },
    },
    "eslint:fix": {
      description: "Fix lint errors and prune unused suppressions.",
      message: "Fixing lint errors...",
      aliases: "lint:fix",
      arguments(config, args) {
        useCache(config, args);

        ensureIncludes(args, "--fix");

        if (hasSuppressions(args)) {
          ensureIncludes(args, "--prune-suppressions");
        }
      },
    },
    "eslint:suppress": {
      description: "Suppress the remaining lint errors.",
      message: "Suppressing lint errors...",
      aliases: "lint:suppress",
      arguments(config, args) {
        useCache(config, args);

        ensureAnyOf(
          args,
          ["--suppress-all", "--suppress-rule"],
          "--suppress-all",
        );
      },
    },
  },
});
