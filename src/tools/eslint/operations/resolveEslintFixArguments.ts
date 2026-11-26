import { pathExists, relativeWithin } from "#foundation/filesystem/index";
import { ensureIncludes, hasOption } from "#foundation/processes/index";
import { resolveEslintArguments } from "#tools/eslint/operations/resolveEslintArguments";
import type { LoadedConfig } from "#project/config/index";

export async function resolveEslintFixArguments(
  args: readonly string[],
  config: LoadedConfig,
): Promise<string[]> {
  const resolved = resolveEslintArguments(args);

  ensureIncludes(resolved, "--fix");

  if (hasOption(resolved, ["--suppressions-location"])) {
    ensureIncludes(resolved, "--prune-suppressions");

    return resolved;
  }

  const resources = await config.resolve("resources");

  const suppressions = resources.path("eslint-suppressions.json");

  if (await pathExists(suppressions)) {
    ensureIncludes(resolved, "--prune-suppressions");

    ensureIncludes(resolved, [
      "--suppressions-location",
      relativeWithin(config.context.root, suppressions),
    ]);
  }

  return resolved;
}
