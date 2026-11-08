import { ensureAnyOf, ensureIncludes } from "#foundation/processes/index";

export function resolvePrettierArguments(args: readonly string[]): string[] {
  const resolved = [...args];

  ensureAnyOf(
    resolved,
    ["--check", "-c", "--write", "-w", "--list-different", "-l"],
    "--write",
  );

  ensureIncludes(resolved, "--ignore-unknown");

  return resolved;
}
