import { ensureAnyOf } from "#foundation/processes/index";

export function includeTypeTests(args: readonly string[]): string[] {
  const included = [...args];

  ensureAnyOf(included, ["--typecheck", "--no-typecheck"], "--typecheck");

  return included;
}
