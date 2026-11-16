import { ensureAnyOf } from "#foundation/processes/index";
import { resolveEslintArguments } from "#tools/eslint/operations/resolveEslintArguments";

export function resolveEslintSuppressArguments(
  args: readonly string[],
): string[] {
  const resolved = resolveEslintArguments(args);

  ensureAnyOf(
    resolved,
    ["--suppress-all", "--suppress-rule"],
    "--suppress-all",
  );

  return resolved;
}
