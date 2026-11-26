import { ensureNativeConfigLoader } from "#tools/vitest/operations/ensureNativeConfigLoader";
import { includeTypeTests } from "#tools/vitest/operations/includeTypeTests";
import { dropVitestMode } from "#tools/vitest/utils/dropVitestMode";

export function resolveVitestWatchArguments(args: readonly string[]): string[] {
  return ensureNativeConfigLoader([
    "watch",
    ...includeTypeTests(dropVitestMode("watch", args)),
  ]);
}
