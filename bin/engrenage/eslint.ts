import { packages } from "#constants";
import { pathExists } from "#foundation/filesystem/index";
import { resolve } from "#foundation/filesystem/utils/resolve";
import { defaultSuppressionsFile } from "#tools/eslint/constants";
import { defineToolCommands } from "#workflows/cli/operations/defineToolCommands";
import { ensureAnyOf } from "#workflows/cli/operations/ensureAnyOf";
import { ensureIncludes } from "#workflows/cli/operations/ensureIncludes";
import { hasOption } from "#workflows/cli/utils/hasOption";

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
    },
    "eslint:fix": {
      message: "Fixing lint errors...",
      async arguments(_config, args) {
        ensureIncludes(args, "--fix");

        if (await hasSuppressions(args)) {
          ensureIncludes(args, "--prune-suppressions");
        }
      },
    },
    "eslint:suppress": {
      message: "Suppressing lint errors...",
      arguments(_config, args) {
        ensureAnyOf(
          args,
          ["--suppress-all", "--suppress-rule"],
          "--suppress-all",
        );
      },
    },
  },
});
