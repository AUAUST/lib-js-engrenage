import { ensureSourceConfigLoader } from "#tools/vitest/operations/ensureSourceConfigLoader";
import { includeTypeTests } from "#tools/vitest/operations/includeTypeTests";

export function resolveVitestArguments(args: readonly string[]): string[] {
  return ensureSourceConfigLoader(["run", ...includeTypeTests(args)]);
}
