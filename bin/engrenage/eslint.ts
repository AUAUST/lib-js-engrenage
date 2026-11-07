import { packages } from "#constants";
import { pathExists } from "#foundation/filesystem/index";
import { resolve } from "#foundation/filesystem/utils/resolve";
import { cacheSection } from "#project/cache/index";
import { defaultSuppressionsFile } from "#tools/eslint/constants";
import { defineToolCommands } from "#workflows/cli/operations/defineToolCommands";
import { ensureAnyOf } from "#workflows/cli/operations/ensureAnyOf";
import { ensureIncludes } from "#workflows/cli/operations/ensureIncludes";
import { hasOption } from "#workflows/cli/utils/hasOption";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";

// @debt The cache is keyed on each file alone, so type-aware rules keep passing a file whose imported types changed; checks must pass `--no-cache` to be sound.
async function useCache(config: LoadedConfig, args: string[]) {
  if (hasOption(args, ["--no-cache"])) {
    return;
  }

  ensureIncludes(args, "--cache");

  const cache = await config.resolve(cacheSection);

  ensureIncludes(args, ["--cache-location", cache.for(packages.eslint)]);
}

async function hasSuppressions(args: readonly string[]): Promise<boolean> {
  return (
    hasOption(args, ["--suppressions-location"]) ||
    (await pathExists(resolve(process.cwd(), defaultSuppressionsFile)))
  );
}

export const eslint = defineToolCommands({
  packageName: packages.eslint,
  commands: {
    "eslint": {
      message: "Linting...",
      async arguments(config, args) {
        await useCache(config, args);
      },
    },
    "eslint:fix": {
      message: "Fixing lint errors...",
      async arguments(config, args) {
        await useCache(config, args);

        ensureIncludes(args, "--fix");

        if (await hasSuppressions(args)) {
          ensureIncludes(args, "--prune-suppressions");
        }
      },
    },
    "eslint:suppress": {
      message: "Suppressing lint errors...",
      async arguments(config, args) {
        await useCache(config, args);

        ensureAnyOf(
          args,
          ["--suppress-all", "--suppress-rule"],
          "--suppress-all",
        );
      },
    },
  },
});
