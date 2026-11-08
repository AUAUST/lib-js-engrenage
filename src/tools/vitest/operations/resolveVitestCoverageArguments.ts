import { ensureIncludes } from "#foundation/processes/index";

export function resolveVitestCoverageArguments(
  args: readonly string[],
): string[] {
  const resolved = [...args];

  ensureIncludes(resolved, "--coverage");

  return ["run", ...resolved];
}
