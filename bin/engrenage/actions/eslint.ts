import { resolveEslintArguments } from "#tools/eslint/index";

export default function (args: string[]): readonly string[] {
  return resolveEslintArguments(args);
}
