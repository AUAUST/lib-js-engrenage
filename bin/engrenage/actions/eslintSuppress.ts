import { resolveEslintSuppressArguments } from "#tools/eslint/index";

export default function (args: string[]): readonly string[] {
  return resolveEslintSuppressArguments(args);
}
