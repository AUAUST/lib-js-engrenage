import { ensureIncludes } from "#foundation/processes/index";
import { ensureSourceConfigLoader } from "#tools/vitest/operations/ensureSourceConfigLoader";

export function resolveVitestCoverageArguments(
  args: readonly string[],
): string[] {
  const resolved = [...args];

  ensureIncludes(resolved, "--coverage");

  return ensureSourceConfigLoader(["run", ...resolved]);
}
