import { eslintFlagArguments } from "#tools/eslint/constants";

export function resolveEslintArguments(args: readonly string[]): string[] {
  return [...eslintFlagArguments, ...args];
}
