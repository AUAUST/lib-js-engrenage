import { includeTypeTests } from "#tools/vitest/operations/includeTypeTests";

export function resolveVitestArguments(args: readonly string[]): string[] {
  return ["run", ...includeTypeTests(args)];
}
