import { ensureSourceConfigLoader } from "#tools/vitest/operations/ensureSourceConfigLoader";
import { includeTypeTests } from "#tools/vitest/operations/includeTypeTests";
import { dropVitestMode } from "#tools/vitest/utils/dropVitestMode";

export function resolveVitestArguments(args: readonly string[]): string[] {
  return ensureSourceConfigLoader([
    "run",
    ...includeTypeTests(dropVitestMode("run", args)),
  ]);
}
