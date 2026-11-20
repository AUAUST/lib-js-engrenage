import { ensureIncludes } from "#foundation/processes/index";
import { buildMode } from "#tools/vitest/constants";
import { ensureSourceConfigLoader } from "#tools/vitest/operations/ensureSourceConfigLoader";
import { includeTypeTests } from "#tools/vitest/operations/includeTypeTests";
import { dropVitestMode } from "#tools/vitest/utils/dropVitestMode";

export function resolveVitestDistArguments(args: readonly string[]): string[] {
  const resolved = includeTypeTests(dropVitestMode("run", args));

  ensureIncludes(resolved, ["--mode", buildMode]);

  return ensureSourceConfigLoader(["run", ...resolved]);
}
