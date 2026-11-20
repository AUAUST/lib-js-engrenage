import { ensureIncludes } from "#foundation/processes/index";
import { ensureSourceConfigLoader } from "#tools/vitest/operations/ensureSourceConfigLoader";
import { dropVitestMode } from "#tools/vitest/utils/dropVitestMode";

export function resolveVitestCoverageArguments(
  args: readonly string[],
): string[] {
  const resolved = dropVitestMode("run", args);

  ensureIncludes(resolved, "--coverage");

  return ensureSourceConfigLoader(["run", ...resolved]);
}
