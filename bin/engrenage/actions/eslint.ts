import { eslintFlagArguments } from "#tools/eslint/constants";

export default function (args: string[]): readonly string[] {
  return [...eslintFlagArguments, ...args];
}
