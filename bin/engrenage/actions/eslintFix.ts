import { resolveEslintFixArguments } from "#tools/eslint/index";

export default function (args: string[]): Promise<readonly string[]> {
  return resolveEslintFixArguments(args);
}
