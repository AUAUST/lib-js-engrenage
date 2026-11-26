import { ensureNativeConfigLoader } from "#tools/vitest/operations/ensureNativeConfigLoader";
import { includeTypeTests } from "#tools/vitest/operations/includeTypeTests";
import { dropVitestMode } from "#tools/vitest/utils/dropVitestMode";

export function resolveVitestArguments(args: readonly string[]): string[] {
  return ensureNativeConfigLoader([
    "run",
    ...includeTypeTests(dropVitestMode("run", args)),
  ]);
}
