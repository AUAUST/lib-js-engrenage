import { ensureSourceConfigLoader } from "#tools/vitest/operations/ensureSourceConfigLoader";
import { includeTypeTests } from "#tools/vitest/operations/includeTypeTests";

export function resolveVitestWatchArguments(args: readonly string[]): string[] {
  return ensureSourceConfigLoader(["watch", ...includeTypeTests(args)]);
}
