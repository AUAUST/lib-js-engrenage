import { ensureAnyOf } from "#foundation/processes/index";
import { eslintFlagArguments } from "#tools/eslint/constants";

export function resolveEslintSuppressArguments(
  args: readonly string[],
): string[] {
  const resolved = [...eslintFlagArguments, ...args];

  ensureAnyOf(
    resolved,
    ["--suppress-all", "--suppress-rule"],
    "--suppress-all",
  );

  return resolved;
}
