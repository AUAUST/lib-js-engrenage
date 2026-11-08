import { ensureIncludesAll, ensureUnset } from "#foundation/processes/index";

export function resolvePrettierCheckArguments(
  args: readonly string[],
): string[] {
  const resolved = [...args];

  ensureUnset(resolved, ["--write", "-w"]);

  ensureIncludesAll(resolved, [["--check", "-c"], "--ignore-unknown"]);

  return resolved;
}
