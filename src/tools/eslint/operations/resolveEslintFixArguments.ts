import { pathExists, resolve } from "#foundation/filesystem/index";
import { ensureIncludes, hasOption } from "#foundation/processes/index";
import { defaultSuppressionsFile } from "#tools/eslint/constants";

async function hasSuppressions(args: readonly string[]): Promise<boolean> {
  return (
    hasOption(args, ["--suppressions-location"]) ||
    (await pathExists(resolve(process.cwd(), defaultSuppressionsFile)))
  );
}

export async function resolveEslintFixArguments(
  args: readonly string[],
): Promise<string[]> {
  const resolved = [...args];

  ensureIncludes(resolved, "--fix");

  if (await hasSuppressions(resolved)) {
    ensureIncludes(resolved, "--prune-suppressions");
  }

  return resolved;
}
