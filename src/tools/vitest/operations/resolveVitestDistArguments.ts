import { ensureIncludes } from "#foundation/processes/index";
import { buildMode } from "#tools/vitest/constants";
import { ensureNativeConfigLoader } from "#tools/vitest/operations/ensureNativeConfigLoader";
import { includeTypeTests } from "#tools/vitest/operations/includeTypeTests";
import { dropVitestMode } from "#tools/vitest/utils/dropVitestMode";

export function resolveVitestDistArguments(args: readonly string[]): string[] {
  const resolved = includeTypeTests(dropVitestMode("run", args));

  ensureIncludes(resolved, ["--mode", buildMode]);

  return ensureNativeConfigLoader(["run", ...resolved]);
}
