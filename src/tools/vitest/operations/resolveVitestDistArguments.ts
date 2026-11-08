import { ensureIncludes } from "#foundation/processes/index";
import { buildMode } from "#tools/vitest/constants";
import { includeTypeTests } from "#tools/vitest/operations/includeTypeTests";

export function resolveVitestDistArguments(args: readonly string[]): string[] {
  const resolved = includeTypeTests(args);

  ensureIncludes(resolved, ["--mode", buildMode]);

  return ["run", ...resolved];
}
