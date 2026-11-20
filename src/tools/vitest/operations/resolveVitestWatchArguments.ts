import { ensureSourceConfigLoader } from "#tools/vitest/operations/ensureSourceConfigLoader";
import { includeTypeTests } from "#tools/vitest/operations/includeTypeTests";
import { dropVitestMode } from "#tools/vitest/utils/dropVitestMode";

export function resolveVitestWatchArguments(args: readonly string[]): string[] {
  return ensureSourceConfigLoader([
    "watch",
    ...includeTypeTests(dropVitestMode("watch", args)),
  ]);
}
