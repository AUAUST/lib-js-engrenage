import { includeTypeTests } from "#tools/vitest/operations/includeTypeTests";

export function resolveVitestWatchArguments(args: readonly string[]): string[] {
  return ["watch", ...includeTypeTests(args)];
}
