import { ensureAnyOf } from "#foundation/processes/index";

export function resolveEslintSuppressArguments(
  args: readonly string[],
): string[] {
  const resolved = [...args];

  ensureAnyOf(
    resolved,
    ["--suppress-all", "--suppress-rule"],
    "--suppress-all",
  );

  return resolved;
}
