import { ensureIncludes } from "#foundation/processes/index";
import { ensureNativeConfigLoader } from "#tools/vitest/operations/ensureNativeConfigLoader";
import { dropVitestMode } from "#tools/vitest/utils/dropVitestMode";

export function resolveVitestCoverageArguments(
  args: readonly string[],
): string[] {
  const resolved = dropVitestMode("run", args);

  ensureIncludes(resolved, "--coverage");

  return ensureNativeConfigLoader(["run", ...resolved]);
}
