import { existsSync } from "node:fs";

import { eslint } from "#constants";
import {
  defaultCacheLocation,
  defaultSuppressionsFile,
} from "#eslint/constants";
import { defineToolCommands } from "#support/commander/utils/defineToolCommands";
import { ensureAnyOf } from "#support/commander/utils/ensureAnyOf";
import { ensureIncludes } from "#support/commander/utils/ensureIncludes";
import { getOptionsEnd } from "#support/commander/utils/getOptionsEnd";
import { isOptionOf } from "#support/commander/utils/isOptionOf";
import { resolve } from "#support/filesystem/utils/resolve";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

function useCache(config: ResolvedConfig, args: string[]) {
  ensureIncludes(args, "--cache");

  ensureIncludes(args, [
    "--cache-location",
    config.resolve(defaultCacheLocation),
  ]);
}

function hasSuppressions(args: readonly string[]): boolean {
  const locatesSuppressions = args
    .slice(0, getOptionsEnd(args))
    .some((arg) => isOptionOf(arg, ["--suppressions-location"]));

  return (
    locatesSuppressions ||
    existsSync(resolve(process.cwd(), defaultSuppressionsFile))
  );
}

export default defineToolCommands({
  packageName: eslint,
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
